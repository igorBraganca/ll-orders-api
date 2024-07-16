export class Product {
    id: number
    value: number

    constructor(id: number, value: number) {
        this.id = id
        this.value = value
    }

    toDTO() {
        return ProductDTO.fromProduct(this)
    }
}

export class ProductDTO {
    product_id: number
    value: string

    static fromProduct(product: Product) {
        const p = new ProductDTO()
        p.product_id = product.id
        p.value = product.value.toFixed(2)
        return p
    }
}