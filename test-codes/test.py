import requests
  
# defining the api-endpoint 
API_ENDPOINT = "http://localhost:4000/login"

  
# data to be sent to api
data = {"Email" : "atishayjain@gmail3.com","password" : "12345678"}
  
# sending post request and saving response as response object
r = requests.post(url = API_ENDPOINT, data = data)
  
# extracting response text 
print(str(r.text))