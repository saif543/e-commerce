1. The gradient color on top of the Most loved product and New arrival product will be controled by admin panel. 
<Products
        title="Most Loved Products"
        subtitle="Discover our top picks for a premium lifestyle"
        apiUrl="/api/product?isLovedProduct=true&limit=10"
        bg="bg-white"
        bannerGradient="linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 40%, #B8860B 100%)"
      />
      Check the bannerGradient is passing Insted of gradient color we will use image in here but same size as it is now. 

      So create a backend api and in the admin panel add a page where I can add image in here. 


      Same for the new arrival.

      I want to control the image from the admin panel Create the backend api and the admin page where I will control this. But make that it takes the same space as the gradient now taking. 



2. In the ProductView.jsx file
   {/* Category Hero Banner */}
        <div className="relative w-full h-24 min-[480px]:h-28 min-[640px]:h-32 min-[768px]:h-36 min-[1024px]:h-40 overflow-hidden"
            style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d1f3d 40%, #B8860B 100%)" }}
        />

        In this part I want you to make a backend api that will add image based on the category. Check the category api Each category will have a hero image. And I want you to make seperate api that will read all the avaiable category and then admin can add banner image based on these category. And here there is many text with the banner image remove them all just the banner image. And make sure to maintain the same height and width in here of the banner. 


        