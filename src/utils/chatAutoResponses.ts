import type { PolicyProduct } from '../types/Product';

export const generateAutoResponse = (message: string, products: PolicyProduct[]): string | null => {
  const lowerMessage = message.toLowerCase();
  
 
  const ageMatch = message.match(/(\d+)\s*years?\s*old|age\s*(\d+)|i\s*am\s*(\d+)/);
  if (ageMatch) {
    const age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3]);
    const suitableProducts = products.filter(p => age >= p.minAge && age <= p.maxAge);
    
    if (suitableProducts.length > 0) {
      const lifeProducts = suitableProducts.filter(p => p.insuranceType === 0);
      if (lifeProducts.length > 0 && age <= 35) {
        const product = lifeProducts[0];
        return `Perfect age to start! At ${age}, I recommend our ${product.productName}. It offers coverage from ₹${(product.minSumAssured / 100000).toFixed(0)}L to ₹${(product.maxSumAssured / 100000).toFixed(0)}L with ${product.premiumRate}% premium rate. Starting early gives you lower premiums and better coverage. Click 'Contact Agent' below for personalized advice!`;
      }
    }
    return `At ${age} years, you have several great options! Let me connect you with our expert who can recommend the best policy based on your needs and budget. Click 'Contact Agent' below.`;
  }

  if (lowerMessage.includes('life insurance') || lowerMessage.includes('life policy')) {
    const lifeProducts = products.filter(p => p.insuranceType === 0);
    if (lifeProducts.length > 0) {
      const product = lifeProducts[0];
      return `We offer comprehensive Life Insurance plans! Our ${product.productName} provides coverage from ₹${(product.minSumAssured / 100000).toFixed(0)}L to ₹${(product.maxSumAssured / 100000).toFixed(0)}L with premium rates starting at ${product.premiumRate}%. Age eligibility: ${product.minAge}-${product.maxAge} years. Need personalized advice? Click 'Contact Agent' below!`;
    }
  }

  if (lowerMessage.includes('motor insurance') || lowerMessage.includes('car insurance') || lowerMessage.includes('vehicle insurance')) {
    const motorProducts = products.filter(p => p.insuranceType === 1);
    if (motorProducts.length > 0) {
      const product = motorProducts[0];
      return `Our Motor Insurance covers your vehicle comprehensively! ${product.productName} offers coverage up to ₹${(product.maxSumAssured / 100000).toFixed(0)}L with competitive rates at ${product.premiumRate}%. Perfect for ages ${product.minAge}-${product.maxAge}. Get instant quotes online!`;
    }
  }
 
  if (lowerMessage.includes('property insurance') || lowerMessage.includes('home insurance')) {
    const propertyProducts = products.filter(p => p.insuranceType === 2);
    if (propertyProducts.length > 0) {
      const product = propertyProducts[0];
      return `Protect your property with our ${product.productName}! Coverage ranges from ₹${(product.minSumAssured / 100000).toFixed(0)}L to ₹${(product.maxSumAssured / 100000).toFixed(0)}L at ${product.premiumRate}% premium rate. Suitable for ages ${product.minAge}-${product.maxAge}. Secure your home today!`;
    }
  }

  if (lowerMessage.includes('products') || lowerMessage.includes('plans') || lowerMessage.includes('policies')) {
    return `We offer ${products.length} insurance products across Life, Motor, and Property categories. Our plans provide coverage from ₹${Math.min(...products.map(p => p.minSumAssured)) / 100000}L to ₹${Math.max(...products.map(p => p.maxSumAssured)) / 100000}L. Which type interests you most?`;
  }

  if (lowerMessage.includes('premium') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
    const avgRate = (products.reduce((sum, p) => sum + p.premiumRate, 0) / products.length).toFixed(1);
    return `Our premium rates are very competitive! Rates start from ${Math.min(...products.map(p => p.premiumRate))}% and average around ${avgRate}%. Premium depends on coverage amount, age, and policy type. Would you like a personalized quote?`;
  }

  if (lowerMessage.includes('claim') || lowerMessage.includes('settlement')) {
    return `Our claim process is simple and fast! You can file claims online through your dashboard. We process most claims within 7-15 business days. For claim status, please check your 'My Claims' section or provide your policy number.`;
  }

  if (lowerMessage.includes('kyc') || lowerMessage.includes('verification') || lowerMessage.includes('documents')) {
    return `KYC verification is mandatory for policy purchase. Required documents: Identity Proof, Address Proof, Income Certificate, and Medical Certificate (for life insurance). You can upload documents in the KYC section after proposal approval.`;
  }

  if (lowerMessage.includes('best policy') || lowerMessage.includes('which policy') || lowerMessage.includes('recommend')) {
    return `I'd be happy to help you find the best policy! For personalized recommendations based on your age, income, and family situation, our insurance experts can guide you better. Click 'Contact Agent' below to speak with a specialist who can analyze your needs and suggest the perfect plan.`;
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('help')) {
    return `Hello! Welcome to our Insurance Support. I can help with basic information about our products, but for personalized advice, our agents are here to help. How can I assist you today?`;
  }
  
  return null;
};

export const getWelcomeMessage = (): string => {
  return "Hello! Welcome to our Customer Support. I can provide quick answers about our insurance products. For personalized recommendations, click 'Contact Agent' below to speak with our experts. How can I help you today?";
};

export const shouldShowContactButton = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();
  return lowerMessage.includes('recommend') || 
         lowerMessage.includes('best policy') || 
         lowerMessage.includes('which') || 
         /\d+\s*years?\s*old/.test(message) ||
         lowerMessage.includes('advice') ||
         lowerMessage.includes('help me choose');
};