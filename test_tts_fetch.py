import urllib.request

url = "https://translate.google.com/translate_tts?ie=UTF-8&tl=sv&client=tw-ob&q=" + urllib.parse.quote("Hej, hur mår du?")
headers = {'User-Agent': 'Mozilla/5.0'}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
        print(f"Google TTS fetched successfully: {len(data)} bytes, content-type: {resp.headers.get('content-type')}")
except Exception as e:
    print(f"Google TTS fetch failed: {e}")
