import { NextRequest, NextResponse } from "next/server";
import { getPaginatedProductsServer } from "@/server/products";
import { enrichProductsWithDisplayPrices } from "@/server/enrich-products";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(request: NextRequest) {
  if (!API_BASE_URL?.trim()) {
    return NextResponse.json(
      { success: false, message: "API not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "12";
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const subcategory = searchParams.get("subcategory") ?? "";
  const homeRow = searchParams.get("homeRow") ?? "";
  const sortBy = searchParams.get("sortBy") ?? "skuArrangementOrderNo";
  const sortOrder = searchParams.get("sortOrder") ?? "asc";

  const validHomeRow: 'bestsellers' | 'new-arrivals' | undefined =
    homeRow === 'bestsellers'
      ? 'bestsellers'
      : homeRow === 'new-arrivals'
        ? 'new-arrivals'
        : undefined;

  const productParams = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    search: search || undefined,
    category: category || undefined,
    subcategory: subcategory || undefined,
    homeRow: validHomeRow,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  };

  try {
    const result = await getPaginatedProductsServer(productParams);

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch products" },
        { status: 502 }
      );
    }

    const enrichedData = await enrichProductsWithDisplayPrices(
      result.data as Array<{
        _id: string;
        price?: number;
        updatedPrice?: number;
        finalPriceDiscount?: number;
      }>
    );

    return NextResponse.json(
      {
        success: true,
        data: enrichedData,
        pagination: result.pagination,
      },
      {
        headers: {
          // Public catalogue data keyed entirely by the query string. Without
          // this every hit — including crawlers — re-ran the function and
          // re-fetched from the origin.
          'Cache-Control':
            'public, s-maxage=300, stale-while-revalidate=3600',
        },
      }
    );
  } catch (err) {
    console.error("Shop products API error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
