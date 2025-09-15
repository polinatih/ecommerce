import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const { storeId } = await context.params; 
    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const body = await req.json();
    const { label, imageUrl } = body;

    if (!label) return new NextResponse("Label is required", { status: 400 });
    if (!imageUrl) return new NextResponse("Image URL is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId: user.id },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const billboard = await prismadb.billboard.create({
  data: { label, imageUrl, storeId },
});

console.log(">>> Created billboard:", billboard); 

return NextResponse.json(billboard);


    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARDS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params; 

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const billboard = await prismadb.billboard.findMany({
      where: { storeId },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARDS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}