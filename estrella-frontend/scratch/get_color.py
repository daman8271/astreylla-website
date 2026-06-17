import urllib.request
from PIL import Image

url = "https://augmont-lgd-prod.b-cdn.net/products/000c08af-305a-47cc-a879-e4a3190aa255/still.jpg"
filename = "/home/divyanshu-sharma/Documents/PayalProject/astreylla-website/estrella-frontend/scratch/sample_diamond.jpg"

try:
    urllib.request.urlretrieve(url, filename)
    with Image.open(filename) as img:
        # Get color at (0, 0)
        color = img.getpixel((0, 0))
        print("Top-left pixel RGB:", color)
        # Convert to hex
        hex_color = '#{:02x}{:02x}{:02x}'.format(*color[:3])
        print("Hex color:", hex_color)
except Exception as e:
    print("Error:", e)
