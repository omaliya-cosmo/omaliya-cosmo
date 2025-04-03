import { prisma } from "@/app/lib/prisma"; // Adjust the import path as necessary

const populateDatabase = async () => {
  // Populating Product Categories
  const electronicsCategory = await prisma.productCategory.create({
    data: {
      name: "Electronics",
      description: "Various electronic devices and gadgets.",
      imageUrl: "https://picsum.photos/300/300?random=1",
    },
  });

  const clothingCategory = await prisma.productCategory.create({
    data: {
      name: "Clothing",
      description: "Fashionable clothes for all seasons.",
      imageUrl: "https://picsum.photos/300/300?random=1",
    },
  });

  const homeAppliancesCategory = await prisma.productCategory.create({
    data: {
      name: "Home Appliances",
      description: "Essential appliances for your home.",
      imageUrl: "https://picsum.photos/300/300?random=1",
    },
  });

  const booksCategory = await prisma.productCategory.create({
    data: {
      name: "Books",
      description: "A variety of books for different interests.",
      imageUrl: "https://picsum.photos/300/300?random=1",
    },
  });

  // Populating Products
  const product1 = await prisma.product.create({
    data: {
      name: "Smartphone",
      description: "Latest model with advanced features.",
      imageUrls: [
        "https://picsum.photos/300/300?random=1",
        "https://picsum.photos/300/300?random=2",
      ],
      categoryId: electronicsCategory.id,
      priceLKR: 50000.0,
      discountPriceLKR: 45000.0,
      priceUSD: 250.0,
      discountPriceUSD: 200.0,
      stock: 100,
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "T-Shirt",
      description: "Comfortable cotton T-shirt in various sizes.",
      imageUrls: [
        "https://picsum.photos/300/300?random=3",
        "https://picsum.photos/300/300?random=4",
      ],
      categoryId: clothingCategory.id,
      priceLKR: 2000.0,
      discountPriceLKR: 1800.0,
      priceUSD: 15.0,
      discountPriceUSD: 12.0,
      stock: 50,
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: "Air Conditioner",
      description: "Energy-efficient air conditioner.",
      imageUrls: [
        "https://picsum.photos/300/300?random=5",
        "https://picsum.photos/300/300?random=6",
      ],
      categoryId: homeAppliancesCategory.id,
      priceLKR: 80000.0,
      discountPriceLKR: 75000.0,
      priceUSD: 400.0,
      discountPriceUSD: 350.0,
      stock: 30,
    },
  });

  const product4 = await prisma.product.create({
    data: {
      name: "Cookbook",
      description: "Delicious recipes for every occasion.",
      imageUrls: [
        "https://picsum.photos/300/300?random=7",
        "https://picsum.photos/300/300?random=8",
      ],
      categoryId: booksCategory.id,
      priceLKR: 1500.0,
      discountPriceLKR: 1200.0,
      priceUSD: 10.0,
      discountPriceUSD: 8.0,
      stock: 200,
    },
  });

  console.log("Populated Product Categories and Products:", {
    electronicsCategory,
    clothingCategory,
    homeAppliancesCategory,
    booksCategory,
    product1,
    product2,
    product3,
    product4,
  });
};

// Execute the populator
populateDatabase()
  .catch((e) => {
    console.error("Error populating database:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default populateDatabase;
