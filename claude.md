1. Create product backend api. Mainly for gadgets products. Add all types of feature in the product api. Also make sure it's using firebase token do not use custom jwt token. Also check the user backend api and see what security we added in the backend api. Sanitization input sanitization everything will be here in this backend api. Also check if the user has all those feature or not. 

THis type of secutory contrant
// 🔐 SECURITY CONSTANTS
const MAX_IMAGE_SIZE_ADMIN = 100 * 1024 * 1024 // 100MB for admin/moderator
const MAX_IMAGE_SIZE_USER = 5 * 1024 * 1024 // 5MB for regular users
const MAX_IMAGES_PER_UPLOAD = 15 // Allow more images for clothing (multiple angles, colors)
const MAX_REQUEST_BODY_SIZE = 100000 // 100KB for larger clothing data
const MAX_SEARCH_LENGTH = 100
const MAX_FILENAME_LENGTH = 255
const MAX_DESCRIPTION_WORDS = 3000 // 3000 word limit for detailed clothing descriptions
const MAX_DESCRIPTION_IMAGES = 10 // Max images in description

// IP-based upload tracking to prevent abuse

// Rate limiting for user and admin. 

Each section should have their own sanitization. 

DDos prevention and all the other security. I want Each of my backend file to created like this. 

AFter creating the Product backend api 

2. Create the slider backend api. 

3. Create a Brand Backend api. Where user will upload an image and name of this branch. Then this brand he can be use when creating a product he will add those brand that he created if he wants. 

4. Orders backend api for user orders. 

5. Add to cart for user orders. 


You understand that right?

[ALSO MENTION IN THE PROJECT_DOCUMENTATION.md file that all the backend file will be created like this using this security constrains and all the other security features.]
