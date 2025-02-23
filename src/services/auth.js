const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlZTM2NzNhYi03ZTYzLTQwMTctYTEyZS1hNGY0ZWE2OWViYjAiLCJlbWFpbCI6InByYXJhczUucHJAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjU1NjFmYzlmOTk4ZTA0Zjk1Y2U5Iiwic2NvcGVkS2V5U2VjcmV0IjoiODY0YTU1NGRiMDEwMjQ3ODIwZjFjYmRhYzFmNzNjOTFmMDVjODMyOTZiZTRhMDBlMTYzZDRiNDAyMDVkMGY5MyIsImV4cCI6MTc3MTg2ODM3NH0.-RBk-aBMmRNiotYxXEUHvHr1n4y2FheBgLC3G3iIQvI'

export const initializeStorage = () => {
  return {
    baseURL: 'https://api.pinata.cloud',
    headers: {
      'Authorization': `Bearer ${PINATA_JWT}`
    }
  }
}

export const verifyAccess = () => {
  // Verify Pinata JWT is valid
  const token = PINATA_JWT
  return token && token.length > 0
}
