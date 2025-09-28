import google.generativeai as genai
import PIL.Image


# --- 1. Configure your API Key ---
# Make sure to keep your key secret!
GOOGLE_API_KEY = '' 
genai.configure(api_key=GOOGLE_API_KEY)

# --- 2. Create the function ---
def assess_screen_damage(image_path):
    """
    Sends an image to the Gemini API to assess screen damage.
    """
    try:
        # Load the image
        img = PIL.Image.open(image_path)
        
        # Select the model (gemini-pro-vision is for multimodal tasks)
        model = genai.GenerativeModel('models/gemini-flash-latest')
        
        # --- 3. Define the prompt and send the request ---
        prompt = """
        First, identify the main object in the image.
        Then, analyze the object for any signs of physical damage.
        - Describe any imperfections you see (e.g., scratches, dents, cracks, tears, discoloration).
        - Classify the overall damage severity as 'None', 'Minor', 'Moderate', or 'Severe'.
        - Provide a brief justification for your classification.
        """
        
        # The API call includes the prompt and the image
        response = model.generate_content([prompt, img])
        
        # --- 4. Return the response text ---
        return response.text
        
    except Exception as e:
        return f"An error occurred: {e}"

# --- Let's test it with an example image ---
# Replace with the actual path to your image file
image_file = r'C:\Alt-projects\Hackathons\Samsung PRISM\AutoHealth1\Screenshot 2025-09-28 113038.png' 
assessment = assess_screen_damage(image_file)

print("--- Damage Assessment ---")
print(assessment)