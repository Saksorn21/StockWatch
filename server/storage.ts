// Storage interface for future database integration
// Currently using localStorage on frontend for portfolio data

export interface IStorage {
  // Future database storage methods can be added here
  // Currently not needed as we use localStorage for portfolio data
}

export class MemStorage implements IStorage {
  constructor() {
    // In-memory storage implementation
    // Currently not used as portfolio data is stored in localStorage
  }
}