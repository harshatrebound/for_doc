-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "keywords" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "ogImage" TEXT;
