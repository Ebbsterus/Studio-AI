import urllib.request, json

URL = "http://192.168.50.195:8000/chat"

print("Studio AI — test console  (type 'quit' to exit)\n")
while True:
    msg = input("You: ").strip()
    if not msg or msg.lower() == "quit":
        break
    body = json.dumps({"message": msg}).encode()
    req  = urllib.request.Request(URL, data=body, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            reply = json.loads(r.read())["reply"]
        print(f"\nBot: {reply}\n")
    except Exception as e:
        print(f"\nError: {e}\n")
