import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { productApi } from "../api/product.api";
import type { PolicyProduct, QuoteRequest, QuoteResponse } from "../types/Product";

type ProductsPageData = {
  products: PolicyProduct[];
  insuranceTypes: string[];
  enums: any;
};

type CustomerJourneyData = {
  products: PolicyProduct[];
  insuranceTypes: string[];
  enums: any;
  userData?: any;
  userProposals?: any;
  userDocuments?: any;
  selectedProduct?: PolicyProduct;
  premiumQuote?: QuoteResponse;
  timestamp: string;
};

type ProductState = {
  products: PolicyProduct[];
  selectedProduct: PolicyProduct | null;
  currentQuote: QuoteResponse | null;
  insuranceTypes: string[];
  productsPageData: ProductsPageData | null;
  productsPageCacheTime: number;
  customerJourneyData: CustomerJourneyData | null;
  customerJourneyCacheTime: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  selectedProduct: null,
  currentQuote: null,
  insuranceTypes: [],
  productsPageData: null,
  productsPageCacheTime: 0,
  customerJourneyData: null,
  customerJourneyCacheTime: 0,
  loading: false,
  error: null
}

// Async thunks
export const fetchAllProducts = createAsyncThunk(
  'product/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const products = await productApi.getAllProducts();
      return products;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (productId: string) => {
    return await productApi.getProductById(productId);
  }
);

export const fetchProductsByType = createAsyncThunk(
  'product/fetchByType',
  async (insuranceType: string) => {
    return await productApi.getProductsByType(insuranceType);
  }
);

export const fetchInsuranceTypes = createAsyncThunk(
  'product/fetchTypes',
  async (_, { rejectWithValue }) => {
    try {
      const types = await productApi.getInsuranceTypes();
      return types;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const calculatePremium = createAsyncThunk(
  'product/calculatePremium',
  async (quoteRequest: QuoteRequest, { rejectWithValue }) => {
    try {
      return await productApi.calculatePremium(quoteRequest);
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkEligibility = createAsyncThunk(
  'product/checkEligibility',
  async ({ productId, age }: { productId: string; age: number }) => {
    return await productApi.checkEligibility(productId, age);
  }
);

// Consolidated products page data with caching (30 minutes)
const PRODUCTS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const CUSTOMER_JOURNEY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for user-specific data

export const fetchProductsPageData = createAsyncThunk(
  'product/fetchProductsPageData',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { product: ProductState };
      const now = Date.now();
      
      // Check if we have cached data that's still valid
      if (state.product.productsPageData && 
          (now - state.product.productsPageCacheTime) < PRODUCTS_CACHE_DURATION) {
        return state.product.productsPageData;
      }
      
      // Fetch fresh data
      const data = await productApi.getProductsPageData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const forceRefreshProductsPageData = createAsyncThunk(
  'product/forceRefreshProductsPageData',
  async (_, { rejectWithValue }) => {
    try {
      const data = await productApi.getProductsPageData();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Customer journey consolidated data with caching
export const fetchCustomerJourneyData = createAsyncThunk(
  'product/fetchCustomerJourneyData',
  async (request: { userId?: string; productId?: string; quoteRequest?: QuoteRequest }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { product: ProductState };
      const now = Date.now();
      
      // Check if we have cached data that's still valid (only for same user)
      if (state.product.customerJourneyData && 
          (now - state.product.customerJourneyCacheTime) < CUSTOMER_JOURNEY_CACHE_DURATION &&
          !request.quoteRequest) { // Don't use cache for quote calculations
        return state.product.customerJourneyData;
      }
      
      // Fetch fresh data
      const data = await productApi.getCustomerJourneyData(request);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const calculatePremiumWithContext = createAsyncThunk(
  'product/calculatePremiumWithContext',
  async (request: { userId?: string; quoteRequest: QuoteRequest }, { rejectWithValue }) => {
    try {
      const data = await productApi.calculatePremiumWithContext(request);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'product/create',
  async (productData: any) => {
    return await productApi.createProduct(productData);
  }
);

export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ productId, updates }: { productId: string; updates: any }) => {
    return await productApi.updateProduct(productId, updates);
  }
);

export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (productId: string) => {
    await productApi.deleteProduct(productId);
    return productId;
  }
);

export const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setSelectedProduct: (state, action: PayloadAction<PolicyProduct>) => {
      state.selectedProduct = action.payload;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearCurrentQuote: (state) => {
      state.currentQuote = null;
    },
    setCurrentQuote: (state, action: PayloadAction<QuoteResponse>) => {
      state.currentQuote = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to fetch products';
      })
 
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })

      .addCase(fetchProductsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByType.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchInsuranceTypes.fulfilled, (state, action) => {
        state.insuranceTypes = action.payload;
      })

      .addCase(calculatePremium.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculatePremium.fulfilled, (state, action) => {
        state.loading = false;
        state.currentQuote = action.payload;
        state.error = null;
      })
      .addCase(calculatePremium.rejected, (state, action) => {
        state.loading = false;
        const errorPayload = action.payload as any;
        state.error = errorPayload?.message || errorPayload || action.error.message || 'Failed to calculate premium';
        state.currentQuote = null;
      })
      
      // Products page data consolidated fetch
      .addCase(fetchProductsPageData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsPageData.fulfilled, (state, action) => {
        state.loading = false;
        state.productsPageData = action.payload;
        state.productsPageCacheTime = Date.now();
        // Update individual state properties for backward compatibility
        state.products = action.payload.products;
        state.insuranceTypes = action.payload.insuranceTypes;
      })
      .addCase(fetchProductsPageData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to fetch products page data';
      })
      
      // Force refresh products page data
      .addCase(forceRefreshProductsPageData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forceRefreshProductsPageData.fulfilled, (state, action) => {
        state.loading = false;
        state.productsPageData = action.payload;
        state.productsPageCacheTime = Date.now();
        // Update individual state properties for backward compatibility
        state.products = action.payload.products;
        state.insuranceTypes = action.payload.insuranceTypes;
      })
      .addCase(forceRefreshProductsPageData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to refresh products page data';
      })
      
      // Customer journey data consolidated fetch
      .addCase(fetchCustomerJourneyData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerJourneyData.fulfilled, (state, action) => {
        state.loading = false;
        state.customerJourneyData = action.payload;
        state.customerJourneyCacheTime = Date.now();
        // Update individual state properties for backward compatibility
        state.products = action.payload.products;
        state.insuranceTypes = action.payload.insuranceTypes;
        if (action.payload.selectedProduct) {
          state.selectedProduct = action.payload.selectedProduct;
        }
        if (action.payload.premiumQuote) {
          state.currentQuote = action.payload.premiumQuote;
        }
      })
      .addCase(fetchCustomerJourneyData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to fetch customer journey data';
      })
      
      // Calculate premium with context
      .addCase(calculatePremiumWithContext.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(calculatePremiumWithContext.fulfilled, (state, action) => {
        state.loading = false;
        state.customerJourneyData = action.payload;
        state.customerJourneyCacheTime = Date.now();
        // Update individual state properties
        if (action.payload.premiumQuote) {
          state.currentQuote = action.payload.premiumQuote;
        }
      })
      .addCase(calculatePremiumWithContext.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || action.error.message || 'Failed to calculate premium with context';
      });
  },
});

export const fetchProducts = fetchAllProducts;

export const { 
  setSelectedProduct, 
  clearSelectedProduct, 
  clearCurrentQuote, 
  setCurrentQuote,
  clearError 
} = productSlice.actions;

export default productSlice.reducer;
