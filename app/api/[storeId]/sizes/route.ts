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
    const { name, value } = body;

    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId: user.id },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const size = await prismadb.size.create({
  data: { name, value, storeId },
});

console.log(">>> Created size:", size); 

return NextResponse.json(size);


    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZES_POST]", error);
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

    const sizes = await prismadb.size.findMany({
      where: { storeId },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.log("[SIZES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}