export default interface Paginated<T> {
    items: T[]
    page: number
    pages: number
}
