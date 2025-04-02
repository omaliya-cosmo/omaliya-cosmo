import { prisma } from "@/app/lib/prisma";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const sort = searchParams.get('sort') || 'newest';
    const categoryId = searchParams.get('category');
    const search = searchParams.get('search');
    const minPriceLKR = searchParams.get('minPriceLKR') ? parseFloat(searchParams.get('minPriceLKR')!) : undefined;
    const maxPriceLKR = searchParams.get('maxPriceLKR') ? parseFloat(searchParams.get('maxPriceLKR')!) : undefined;
    const minPriceUSD = searchParams.get('minPriceUSD') ? parseFloat(searchParams.get('minPriceUSD')!) : undefined;
    const maxPriceUSD = searchParams.get('maxPriceUSD') ? parseFloat(searchParams.get('maxPriceUSD')!) : undefined;
    const inStock = searchParams.get('inStock') === 'true';
    const rating = searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined;

    // Get cookie for currency preference (defaults to LKR)
    const cookieStore = await cookies();
    const countryCookie = cookieStore.get('country');
    const country = countryCookie?.value || 'LK';
    const currency = country === 'LK' ? 'LKR' : 'USD';

    // Build filter conditions
    const where: any = {};
    
    if (categoryId) {
      where.categoryId = categoryId;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Handle price filtering based on currency
    if (currency === 'LKR') {
      if (minPriceLKR !== undefined) {
        where.priceLKR = {
          ...where.priceLKR,
          gte: minPriceLKR
        };
      }
      
      if (maxPriceLKR !== undefined) {
        where.priceLKR = {
          ...where.priceLKR,
          lte: maxPriceLKR
        };
      }
    } else {
      if (minPriceUSD !== undefined) {
        where.priceUSD = {
          ...where.priceUSD,
          gte: minPriceUSD
        };
      }
      
      if (maxPriceUSD !== undefined) {
        where.priceUSD = {
          ...where.priceUSD,
          lte: maxPriceUSD
        };
      }
    }
    
    if (inStock) {
      where.stock = {
        gt: 0
      };
    }
    
    if (rating !== undefined) {
      where.reviews = {
        some: {
          rating: {
            gte: rating
          }
        }
      };
    }

    // Build sort conditions
    let orderBy: any = {};
    
    switch (sort) {
      case 'newest':
        orderBy = { id: 'desc' }; // Using ID as a proxy for creation date
        break;
      case 'oldest':
        orderBy = { id: 'asc' }; // Using ID as a proxy for creation date
        break;
      case 'price-low':
        // Sort by the appropriate currency price
        orderBy = currency === 'LKR' ? { priceLKR: 'asc' } : { priceUSD: 'asc' };
        break;
      case 'price-high':
        // Sort by the appropriate currency price
        orderBy = currency === 'LKR' ? { priceLKR: 'desc' } : { priceUSD: 'desc' };
        break;
      case 'rating':
        orderBy = {
          reviews: {
            _avg: {
              rating: 'desc'
            }
          }
        };
        break;
      case 'reviews':
        orderBy = {
          reviews: {
            _count: 'desc'
          }
        };
        break;
      default:
        orderBy = { id: 'desc' };
    }

    // Count total products for pagination
    const totalProducts = await prisma.product.count({ where });
    const totalPages = Math.ceil(totalProducts / pageSize);

    // Get products with pagination
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        reviews: {
          select: {
            rating: true,
          }
        }
      }
    });

    // Calculate average rating and format product data
    const formattedProducts = products.map(product => {
      // Calculate average rating
      const ratings = product.reviews.map(review => review.rating);
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        images: product.imageUrls,
        category: {
          id: product.category.id,
          name: product.category.name
        },
        price: currency === 'LKR' ? product.priceLKR : product.priceUSD,
        currency,
        stock: product.stock,
        inStock: product.stock > 0,
        rating: averageRating,
        reviewCount: product.reviews.length
      };
    });

    // Return paginated result
    return new Response(JSON.stringify({ 
      products: formattedProducts, 
      totalProducts, 
      totalPages,
      currentPage: page,
      pageSize,
      currency
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new Response(JSON.stringify({ 
      error: "Failed to fetch products",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}