export interface Consumer {
  register(): Promise<void>
}