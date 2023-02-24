import requests as req
import json
token = 130303
token_in_json = {'token': token}
resp = req.get("http://localhost:5000/secfiles/1000032", params={})
