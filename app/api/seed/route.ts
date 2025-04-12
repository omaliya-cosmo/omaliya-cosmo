// app/api/seed/route.ts
import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  try {
    // Clear existing data (optional, comment out if not needed)
    await prisma.orderItem.deleteMany();
    await prisma.productsOnBundles.deleteMany();
    await prisma.bundleOffer.deleteMany();
    await prisma.videos.deleteMany();
    await prisma.promoCode.deleteMany();
    await prisma.order.deleteMany();
    await prisma.address.deleteMany();
    await prisma.review.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.product.deleteMany();
    await prisma.productCategory.deleteMany();
    await prisma.admin.deleteMany();

    // Seed ProductCategory
    const categories = [];
    for (let i = 0; i < 5; i++) {
      const category = await prisma.productCategory.create({
        data: {
          name: faker.commerce.department(),
          description: faker.lorem.sentence(),
          imageUrl: faker.image.url(),
        },
      });
      categories.push(category);
    }

    // Seed Products
    const products = [];
    for (let i = 0; i < 20; i++) {
      const product = await prisma.product.create({
        data: {
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          imageUrls: [faker.image.url(), faker.image.url()],
          categoryId: faker.helpers.arrayElement(categories).id,
          priceLKR: parseFloat(faker.commerce.price({ min: 500, max: 10000 })),
          discountPriceLKR: faker.datatype.boolean()
            ? parseFloat(faker.commerce.price({ min: 300, max: 8000 }))
            : null,
          priceUSD: parseFloat(faker.commerce.price({ min: 5, max: 100 })),
          discountPriceUSD: faker.datatype.boolean()
            ? parseFloat(faker.commerce.price({ min: 3, max: 80 }))
            : null,
          stock: faker.number.int({ min: 0, max: 100 }),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      });
      products.push(product);
    }

    // Seed Customers
    const customers = [];
    for (let i = 0; i < 10; i++) {
      const customer = await prisma.customer.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          passwordHash: faker.internet.password(),
          registeredAt: faker.date.past(),
        },
      });
      customers.push(customer);
    }

    // Seed Addresses
    const addresses = [];
    for (let i = 0; i < customers.length; i++) {
      const address = await prisma.address.create({
        data: {
          firstName: customers[i].firstName,
          lastName: customers[i].lastName,
          phoneNumber: faker.phone.number(),
          email: customers[i].email,
          addressLine1: faker.location.streetAddress(),
          addressLine2: faker.datatype.boolean()
            ? faker.location.secondaryAddress()
            : null,
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
          customerId: customers[i].id,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      });
      addresses.push(address);
    }

    // Seed Reviews
    for (let i = 0; i < 30; i++) {
      await prisma.review.create({
        data: {
          productId: faker.helpers.arrayElement(products).id,
          userId: faker.helpers.arrayElement(customers).id,
          rating: faker.number.int({ min: 1, max: 5 }),
          review: faker.datatype.boolean() ? faker.lorem.paragraph() : null,
          date: faker.date.past(),
        },
      });
    }

    // Seed Orders
    const orders = [];
    for (let i = 0; i < 15; i++) {
      const order = await prisma.order.create({
        data: {
          customerId: faker.helpers.arrayElement(customers).id,
          orderDate: faker.date.past(),
          deliveredAt: faker.datatype.boolean() ? faker.date.recent() : null,
          subtotal: parseFloat(faker.commerce.price({ min: 1000, max: 20000 })),
          discountAmount: faker.datatype.boolean()
            ? parseFloat(faker.commerce.price({ min: 100, max: 5000 }))
            : 0,
          shipping: parseFloat(faker.commerce.price({ min: 50, max: 500 })),
          total: parseFloat(faker.commerce.price({ min: 1000, max: 20000 })),
          currency: faker.helpers.arrayElement(["LKR", "USD"]),
          status: faker.helpers.arrayElement([
            "PENDING",
            "PROCESSING",
            "SHIPPED",
            "CANCELED",
            "DELIVERED",
          ]),
          notes: faker.datatype.boolean() ? faker.lorem.sentence() : null,
          trackingNumber: faker.datatype.boolean()
            ? faker.string.alphanumeric(10)
            : null,
          paymentMethod: faker.helpers.arrayElement([
            "CASH_ON_DELIVERY",
            "PAY_HERE",
            "KOKO",
          ]),
          addressId: faker.helpers.arrayElement(addresses).id,
        },
      });
      orders.push(order);
    }

    // Seed OrderItems
    for (let i = 0; i < 40; i++) {
      await prisma.orderItem.create({
        data: {
          orderId: faker.helpers.arrayElement(orders).id,
          productId: faker.helpers.arrayElement(products).id,
          quantity: faker.number.int({ min: 1, max: 5 }),
          price: parseFloat(faker.commerce.price({ min: 500, max: 10000 })),
          isBundle: false,
        },
      });
    }

    // Seed PromoCodes
    for (let i = 0; i < 5; i++) {
      await prisma.promoCode.create({
        data: {
          code: faker.string.alphanumeric(8).toUpperCase(),
          discountPercentage: parseFloat(
            faker.commerce.price({ min: 5, max: 50 })
          ),
          createdAt: faker.date.past(),
          expiresAt: faker.datatype.boolean() ? faker.date.future() : null,
        },
      });
    }

    // Seed Videos
    for (let i = 0; i < 3; i++) {
      await prisma.videos.create({
        data: {
          title: faker.lorem.words(3),
          videoUrl: faker.internet.url(),
          createdAt: faker.date.past(),
        },
      });
    }

    // Seed BundleOffers
    const bundles = [];
    for (let i = 0; i < 5; i++) {
      const bundle = await prisma.bundleOffer.create({
        data: {
          bundleName: faker.commerce.productName() + " Bundle",
          originalPriceLKR: parseFloat(
            faker.commerce.price({ min: 5000, max: 20000 })
          ),
          originalPriceUSD: parseFloat(
            faker.commerce.price({ min: 50, max: 200 })
          ),
          offerPriceLKR: parseFloat(
            faker.commerce.price({ min: 3000, max: 15000 })
          ),
          offerPriceUSD: parseFloat(
            faker.commerce.price({ min: 30, max: 150 })
          ),
          endDate: faker.date.future(),
          imageUrl: faker.datatype.boolean() ? faker.image.url() : null,
          createdAt: faker.date.past(),
        },
      });
      bundles.push(bundle);
    }

    // Seed ProductsOnBundles
    for (let i = 0; i < 15; i++) {
      await prisma.productsOnBundles.create({
        data: {
          productId: faker.helpers.arrayElement(products).id,
          bundleId: faker.helpers.arrayElement(bundles).id,
        },
      });
    }

    // Seed Admins
    for (let i = 0; i < 2; i++) {
      await prisma.admin.create({
        data: {
          username: faker.internet.userName(),
          passwordHash: faker.internet.password(),
          image: faker.datatype.boolean() ? faker.image.url() : null,
        },
      });
    }

    await prisma.$disconnect();
    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (error: any) {
    await prisma.$disconnect();
    return NextResponse.json(
      { error: "Failed to seed database", details: error.message },
      { status: 500 }
    );
  }
}
