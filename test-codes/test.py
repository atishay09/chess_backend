import requests
  
# defining the api-endpoint 
API_ENDPOINT = "http://localhost:4000/api/addCoins"

  
# data to be sent to api
data = {"userid":"rontinag311641793193347","coins":200}
  
# sending post request and saving response as response object
r = requests.post(url = API_ENDPOINT, data = data)
  
# extracting response text 
print(str(r.text))