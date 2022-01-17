# importing the requests library
import requests
import json
# defining the api-endpoint 
API_ENDPOINT = "https://chessgame-backend.herokuapp.com/api/testAlter"


data = {'email':"jidnyeshaj@gmail.com"}
  
# sending post request and saving response as response object
r = requests.post(url = API_ENDPOINT, data = data)

print(str(r))