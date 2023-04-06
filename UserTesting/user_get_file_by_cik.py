import requests
import os

API_TOKEN = 'your_token'
r = requests.get('http://localhost:5000/secfiles/1000032')

#check if the request was successful
print(r.status_code)

#get the current directory
directory = os.path.dirname(__file__)

#save the file to the current directory
with open(f'{directory}/test.zip', 'wb') as f:
    f.write(r.content)

#close the request
r.close()

#close the file
f.close()
