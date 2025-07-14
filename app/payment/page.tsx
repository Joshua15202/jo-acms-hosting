import EnhancedPaymentClient from "@/components/enhanced-payment-client"

const PaymentPage = () => {
  // Dummy user data for demonstration purposes
  const user = {
    id: "user123",
    name: "John Doe",
    email: "john.doe@example.com",
  }

  return <EnhancedPaymentClient user={user} />
}

export default PaymentPage
