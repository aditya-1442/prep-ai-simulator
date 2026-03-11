import time
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi
import requests
from bs4 import BeautifulSoup
from markdownify import markdownify as md
from .schemas import ExtractionResult

def extract_youtube_video_id(url: str) -> str:
    """Extracts the video ID from a YouTube URL."""
    try:
        parsed_url = urlparse(url)
        if parsed_url.hostname in ('youtu.be', 'www.youtu.be'):
            return parsed_url.path[1:]
        if parsed_url.hostname in ('youtube.com', 'www.youtube.com'):
            if parsed_url.path == '/watch':
                return parse_qs(parsed_url.query)['v'][0]
    except Exception as e:
        print(f"Error parsing YouTube URL {url}: {e}")
    return None

def fetch_youtube_transcript(url: str) -> ExtractionResult:
    """Fetches the transcript of a YouTube video."""
    video_id = extract_youtube_video_id(url)
    if not video_id:
        return ExtractionResult(source_url=url, content=f"Failed to extract video ID from {url}")
    
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
        text = " ".join([t['text'] for t in transcript_list])
        return ExtractionResult(source_url=url, content=text)
    except Exception as e:
        print(f"Error extracting transcript for {url}: {e}")
        return ExtractionResult(source_url=url, content=f"Failed to fetch transcript: {str(e)}")

def fetch_webpage_content(url: str) -> ExtractionResult:
    """Fetches text content from a general webpage and converts to markdown."""
    try:
        # User-Agent to avoid basic blocks
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()

        # Convert to markdown
        markdown_text = md(str(soup), heading_style="ATX")
        
        # Simple cleanup
        lines = [line.strip() for line in markdown_text.splitlines() if line.strip()]
        cleaned_text = "\n".join(lines)
        
        return ExtractionResult(source_url=url, content=cleaned_text)

    except Exception as e:
        print(f"Error extracting webpage {url}: {e}")
        return ExtractionResult(source_url=url, content=f"Failed to fetch webpage content: {str(e)}")

def ingest_urls(urls: list[str]) -> list[ExtractionResult]:
    """Ingests content from a list of assorted URLs."""
    results = []
    for raw_url in urls:
        url = str(raw_url)
        if "youtube.com" in url or "youtu.be" in url:
            results.append(fetch_youtube_transcript(url))
        else:
            results.append(fetch_webpage_content(url))
        # Small sleep to be polite to servers
        time.sleep(1)
    return results
