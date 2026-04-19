export interface Testimonial {
  id: string
  name: string
  city: string
  tourName: string
  rating: number
  quote: string
  avatarInitials: string
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    city: "Nagpur",
    tourName: "Bali Bliss – 7 Nights",
    rating: 5,
    quote:
      "Trendzy Tours made our Bali trip absolutely magical. Every detail was perfectly planned and the 24/7 support gave us total peace of mind. Will definitely book again!",
    avatarInitials: "PS",
  },
  {
    id: "2",
    name: "Rajesh & Sunita Kulkarni",
    city: "Pune",
    tourName: "Europe Grand Tour – 14 Nights",
    rating: 5,
    quote:
      "Our Europe honeymoon was beyond expectations. The itinerary covered everything we wanted — Paris, Rome, Switzerland. The team was responsive and the hotels were excellent.",
    avatarInitials: "RK",
  },
  {
    id: "3",
    name: "Meera Joshi",
    city: "Mumbai",
    tourName: "Ladies Only – Kerala Discovery",
    rating: 5,
    quote:
      "As a solo woman traveller, I felt completely safe and well looked after. The Ladies Only tour was a fabulous experience — met wonderful women from across India!",
    avatarInitials: "MJ",
  },
  {
    id: "4",
    name: "Vikram Patel",
    city: "Ahmedabad",
    tourName: "North Sikkim Adventure – 5 Nights",
    rating: 5,
    quote:
      "The North Sikkim tour was breathtaking. Trendzy's local knowledge and guides made all the difference. Smooth logistics, great stays, and memories for a lifetime.",
    avatarInitials: "VP",
  },
  {
    id: "5",
    name: "Anita & Suresh Desai",
    city: "Nagpur",
    tourName: "Dubai Extravaganza – 5 Nights",
    rating: 5,
    quote:
      "Superb value for money! The Dubai tour included all the must-sees. Trendzy handled everything seamlessly — from airport transfers to desert safari. Highly recommended.",
    avatarInitials: "AD",
  },
]
