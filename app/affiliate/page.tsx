"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/public/assets/img/logo.png";
import { motion } from "framer-motion";
import {
  Check,
  Star,
  Users,
  DollarSign,
  TrendingUp,
  Award,
  Clock,
  Shield,
  ChevronRight,
  Zap,
  BarChart3,
  Target,
  Gift,
  Link as LinkIcon,
  RefreshCw,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getAffiliateUser } from "@/lib/action/user.actions";

const stats = [
  {
    icon: DollarSign,
    label: "Commission Rate",
    value: "30%",
    description: "On every subscription",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    icon: Clock,
    label: "Duration",
    value: "10-36 months",
    description: "Monthly: 10 months, Yearly: 3 years",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: Users,
    label: "Active Affiliates",
    value: "500+",
    description: "Growing community",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: TrendingUp,
    label: "Total Payouts",
    value: "$50K+",
    description: "Paid to affiliates",
    gradient: "from-orange-400 to-red-500",
  },
];

const features = [
  {
    icon: DollarSign,
    title: "High Commission",
    description:
      "Earn 30% on every subscription. Multiple products mean multiple earnings!",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    icon: Shield,
    title: "Reliable Payouts",
    description:
      "Monthly payouts processed on time via your preferred payment method.",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    icon: Award,
    title: "Dual Product Earnings",
    description:
      "Earn from both Web Chatbots and Instagram Automation subscriptions.",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    icon: RefreshCw,
    title: "Recurring Commissions",
    description:
      "Earn for 10 months on monthly plans and 3 years on yearly plans.",
    gradient: "from-orange-400 to-red-500",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "SignUp-Affiliate",
    description:
      "Complete the registration form and get your unique affiliate link.",
    icon: "👥",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    step: "2",
    title: "Share Your Link",
    description:
      "Share your unique link on social media, websites, or with your audience.",
    icon: "🔗",
    gradient: "from-purple-400 to-pink-500",
  },
  {
    step: "3",
    title: "Earn Commissions",
    description: "Get 30% commission when users subscribe through your link.",
    icon: "💰",
    gradient: "from-green-400 to-emerald-500",
  },
  {
    step: "4",
    title: "Get Paid Monthly Now",
    description:
      "Receive your earnings monthly via bank transfer, UPI, or PayPal.",
    icon: "📅",
    gradient: "from-orange-400 to-red-500",
  },
];

const products = [
  {
    name: "Web Chatbots",
    types: ["Customer Support", "Lead Generation", "Education"],
    monthlyPrice: "$49-99",
    commission: "30% for 10 months",
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    name: "Instagram Automation",
    types: ["Starter", "Growth", "Professional"],
    monthlyPrice: "$500-2000",
    commission: "30% for 10 months",
    gradient: "from-purple-400 to-pink-500",
  },
];

const faqData = [
  {
    question: "How do I get paid?",
    answer:
      "We process payouts monthly via bank transfer, UPI, or PayPal. Minimum payout is $50.",
  },
  {
    question: "How long do commissions last?",
    answer:
      "Monthly subscriptions: 10 months. Yearly subscriptions: 3 years. You earn as long as the customer stays subscribed.",
  },
  {
    question: "Can I promote both products?",
    answer:
      "Yes! You earn commissions on both Web Chatbots and Instagram Automation subscriptions.",
  },
  {
    question: "Is there a fee to join?",
    answer: "No, it's completely free to join our affiliate program.",
  },
  {
    question: "When are commissions calculated?",
    answer:
      "Commissions are calculated at the end of each month and paid within 7 business days.",
  },
  {
    question: "Can I track my referrals?",
    answer:
      "Yes, you'll have access to a detailed dashboard showing all your referrals, earnings, and performance metrics.",
  },
];

export default function AffiliateLandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [referrals, setReferrals] = useState(10);
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState(false);
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  useEffect(() => {
    async function fetchAffiliateLink() {
      setLoading(true);
      if (!userId) {
        router.push("/sign-in");
        return;
      }

      try {
        const affiliateLink = await getAffiliateUser(userId);
        if (affiliateLink.success === false) {
          setLink(false);
        } else {
          setLink(true);
        }
      } catch (error: any) {
        console.error("Error fetching Affiliate Link:", error.message);
      } finally {
        setLoading(false);
      }
    }
    if (!isLoaded) {
      return; // Wait for auth to load
    }
    fetchAffiliateLink();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoaded, userId, router]);

  // Theme-based styles
  const containerBg =
    theme === "dark"
      ? "bg-[#0a0a0a]"
      : "bg-gradient-to-b from-gray-200 to-gray-50";
  const headerBg = theme === "dark" ? "bg-[#0a0a0a]/95" : "bg-white/95";
  const badgeBorder =
    theme === "dark" ? "border-[#00F0FF]/30" : "border-blue-700/30";
  const titleText = theme === "dark" ? "text-white" : "text-gray-900";
  const descriptionText = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const cardBg =
    theme === "dark"
      ? "bg-[#1a1a1a]/60 border-white/10"
      : "bg-white border-gray-200";
  const gradientBg =
    theme === "dark"
      ? "from-[#00F0FF]/10 via-[#B026FF]/5 to-transparent"
      : "from-blue-50 via-purple-50 to-transparent";
  const ctaGradient =
    theme === "dark"
      ? "from-[#00F0FF] via-[#B026FF] to-[#FF2E9F]"
      : "from-blue-600 via-purple-600 to-pink-600";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 60,
      scale: 0.9,
      rotateX: -10,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      scale: 1.02,
      borderColor:
        theme === "dark" ? "rgba(0, 240, 255, 0.4)" : "rgba(59, 130, 246, 0.4)",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const titleVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        delay: 0.2,
      },
    },
  };

  // Calculate earnings
  const calculateEarnings = (referralsCount: number) => {
    const avgSubscription = 650;
    const commissionRate = 0.3;
    const monthly = referralsCount * avgSubscription * commissionRate;
    const yearly = monthly * 12;
    const threeYear = yearly * 3;

    return {
      monthly: monthly.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      yearly: yearly.toLocaleString("en-US", { maximumFractionDigits: 0 }),
      threeYear: threeYear.toLocaleString("en-US", {
        maximumFractionDigits: 0,
      }),
    };
  };

  const earnings = calculateEarnings(referrals);
  if (!isLoaded || loading) {
    return (
      <div
        className={`min-h-screen ${titleText} flex items-center justify-center ${containerBg}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00F0FF] mx-auto mb-4"></div>
          <p className={descriptionText}>Loading account...</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`min-h-screen ${containerBg} transition-colors duration-300 relative bg-transparent  z-10`}
    >
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={` fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-lg ${
          scrolled ? `${headerBg} shadow-lg` : "bg-transparent"
        }`}
      >
        <div className=" wrapper2 w-full mx-auto px-4 py-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center">
                <div className="relative h-7 w-7 md:w-10 md:h-10 mr-1 md:mr-3">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#00F0FF] to-[#B026FF] animate-pulse"></div>
                  <div className="absolute inset-1 rounded-full bg-background flex items-center justify-center">
                    <Image
                      alt="Logo"
                      src={Logo}
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                  </div>
                </div>
                <h1 className="text-lg lg:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#00F0FF] to-[#FF2E9F]">
                  Ainpire<span className="text-[#B026FF]">Tech</span>
                </h1>
              </Link>
            </div>
            <div className="flex items-center lg:space-x-6">
              <nav className="hidden md:flex space-x-4 lg:space-x-8">
                {["Features", "HowItWorks", "Earnings", "FAQ"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(" ", "-")}`}
                    className={`font-medium hover:text-[#00F0FF] transition-colors duration-300 ${descriptionText}`}
                  >
                    {item}
                  </a>
                ))}
              </nav>
              <div className="flex items-center space-x-2">
                <ThemeToggle />
                {link ? (
                  <Link href="/affiliate/dashboard" className="">
                    <Button className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF] hover:to-[#B026FF]/90 text-white p-1 font-light md:font-normal">
                      Dashboard
                      <ChevronRight className="ml-1 md:ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/affiliate/register" className="">
                    <Button className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF] hover:to-[#B026FF]/90 text-white p-1 font-light md:font-normal">
                      Join Now <ChevronRight className="ml-1 md:ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F0FF]/5 via-transparent to-[#B026FF]/5" />
        <div className="wrapper2 w-full mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              variants={titleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              className="inline-flex items-center px-4 py-2 rounded-full border border-[#00F0FF]/30 bg-gradient-to-r from-[#00F0FF]/10 to-[#B026FF]/10 mb-6"
            >
              <Star className="w-4 h-4 mr-2 text-[#00F0FF]" />
              <span className="text-sm font-medium bg-gradient-to-r from-[#00F0FF] to-[#B026FF] bg-clip-text text-transparent">
                Earn up to $6,000 per referral
              </span>
            </motion.div>

            <motion.h1
              variants={titleVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-[#00F0FF] via-[#B026FF] to-[#FF2E9F] bg-clip-text text-transparent">
                Become an
              </span>
              <br />
              <span className={titleText}>Affiliate Partner</span>
            </motion.h1>

            <motion.p
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              className="text-xl mb-10 max-w-2xl mx-auto font-montserrat"
            >
              <span className={descriptionText}>
                Promote our powerful automation tools. Earn recurring
                commissions for up to 3 years from every customer you refer.
              </span>
            </motion.p>

            <motion.div
              variants={textVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/affiliate/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF] hover:to-[#00F0FF]/90 text-white px-8 rounded-full"
                >
                  Start Earning Now <Zap className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 rounded-full border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/10"
                >
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-20"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                whileHover="hover"
                whileInView="visible"
                viewport={{ once: false }}
                className={`p-6 rounded-2xl backdrop-blur-sm ${cardBg}`}
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient}`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-bold mb-2 text-blue-700">
                  {stat.value}
                </h3>
                <p className={`font-semibold mb-1 ${titleText} `}>
                  {stat.label}
                </p>
                <p className={`text-sm ${descriptionText} font-montserrat`}>
                  {stat.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00F0FF]/5 to-transparent" />
        <div className="wrapper2 w-full mx-auto px-4 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div
              variants={titleVariants}
              className="flex items-center justify-center text-blue-700 mb-4"
            >
              <span
                className={`text-sm font-medium uppercase tracking-widest border ${badgeBorder} rounded-full px-4 py-1`}
              >
                Why Choose Us
              </span>
            </motion.div>
            <motion.h2
              variants={titleVariants}
              className="text-4xl font-bold mb-4"
            >
              <span className={titleText}>Powerful Features for </span>
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] bg-clip-text text-transparent">
                Maximum Earnings
              </span>
            </motion.h2>
            <motion.p
              variants={textVariants}
              className={`text-lg max-w-2xl mx-auto ${descriptionText} font-montserrat`}
            >
              We have built one of the most rewarding affiliate programs in the
              automation space
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={cardVariants}
                whileHover="hover"
                whileInView="visible"
                viewport={{ once: false }}
                className={`rounded-2xl backdrop-blur-sm ${cardBg}`}
              >
                <div className="p-6">
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`${descriptionText} text-xl font-bold mb-3`}>
                    {feature.title}
                  </h3>
                  <p className={`${descriptionText} font-montserrat`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="howitworks" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#B026FF]/5 via-transparent to-[#00F0FF]/5" />
        <div className="wrapper2 w-full mx-auto px-4 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div
              variants={titleVariants}
              className="flex items-center justify-center text-blue-700 mb-4"
            >
              <span
                className={`text-sm font-medium uppercase tracking-widest border ${badgeBorder} rounded-full px-4 py-1`}
              >
                Get Started
              </span>
            </motion.div>
            <motion.h2
              variants={titleVariants}
              className="text-4xl font-bold mb-4"
            >
              <span className={titleText}>Start Earning in </span>
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] bg-clip-text text-transparent">
                4 Simple Steps
              </span>
            </motion.h2>
          </motion.div>

          <div className="relative max-w-6xl mx-auto">
            {/* <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#00F0FF] via-[#B026FF] to-[#FF2E9F] -translate-y-1/2" /> */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, margin: "-50px" }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative"
            >
              {howItWorks.map((step, index) => (
                <motion.div
                  key={step.step}
                  variants={cardVariants}
                  whileHover="hover"
                  whileInView="visible"
                  viewport={{ once: false }}
                  className="relative"
                >
                  <div
                    className={`p-8 rounded-2xl backdrop-blur-sm ${cardBg} text-center relative z-10`}
                  >
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-full flex items-center justify-center text-white font-bold text-2xl mb-6 mx-auto`}
                    >
                      {step.step}
                    </div>
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <h3 className={`${descriptionText} text-xl font-bold mb-3`}>
                      {step.title}
                    </h3>
                    <p className={`${descriptionText} font-montserrat`}>
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Earnings Calculator */}
      <section id="earnings" className="py-20 relative">
        <div className={` absolute inset-0 bg-gradient-to-br ${gradientBg}`} />
        <div className="wrapper2 w-full mx-auto px-4 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div
              variants={titleVariants}
              className="flex items-center justify-center text-blue-700 mb-4"
            >
              <span
                className={`text-sm font-medium uppercase tracking-widest border ${badgeBorder} rounded-full px-4 py-1`}
              >
                Calculate Earnings
              </span>
            </motion.div>
            <motion.h2
              variants={titleVariants}
              className={`${descriptionText} text-4xl font-bold mb-4`}
            >
              How Much{" "}
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] bg-clip-text text-transparent">
                Can You Earn?
              </span>
            </motion.h2>
            <motion.p
              variants={textVariants}
              className={`text-lg max-w-2xl mx-auto ${descriptionText} font-montserrat`}
            >
              Calculate your potential monthly earnings
            </motion.p>
          </motion.div>

          <motion.div
            variants={cardVariants}
            whileInView="visible"
            viewport={{ once: false }}
            className={`max-w-6xl mx-auto rounded-3xl backdrop-blur-sm ${cardBg} p-8 md:p-12`}
          >
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Products */}
              <div>
                <h3 className={`${descriptionText} text-2xl font-bold mb-8`}>
                  Products You Can Promote
                </h3>
                <div className="space-y-6">
                  {products.map((product) => (
                    <div
                      key={product.name}
                      className={`rounded-2xl p-6 backdrop-blur-sm ${cardBg}`}
                    >
                      <h4
                        className={`${descriptionText} font-bold text-xl mb-4`}
                      >
                        {product.name}
                      </h4>
                      <div className="space-y-3 mb-6">
                        {product.types.map((type) => (
                          <div
                            key={type}
                            className="flex items-center font-montserrat"
                          >
                            <div
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${product.gradient} mr-3 `}
                            />
                            <span className={descriptionText}>{type}</span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className={`text-sm ${descriptionText}`}>
                            Monthly Price
                          </p>
                          <p className={`font-bold text-lg ${descriptionText}`}>
                            {product.monthlyPrice}
                          </p>
                        </div>
                        <div>
                          <p className={`text-sm ${descriptionText}`}>
                            Your Commission
                          </p>
                          <p className="font-bold text-lg text-green-400">
                            {product.commission}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculator */}
              <div>
                <h3 className={`text-2xl font-bold mb-8 ${descriptionText}`}>
                  Earnings Calculator
                </h3>
                <div className="space-y-8">
                  <div>
                    <label className={`block mb-4 ${titleText}`}>
                      Monthly Referrals:{" "}
                      <span className="text-[#00F0FF] font-bold">
                        {referrals}
                      </span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={referrals}
                      onChange={(e) => setReferrals(parseInt(e.target.value))}
                      className="w-full h-3 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-[#00F0FF]"
                    />
                    <div className="flex justify-between mt-2">
                      <span className={descriptionText}>1</span>
                      <span className={descriptionText}>50</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div
                      className={`p-6 rounded-2xl backdrop-blur-sm ${cardBg}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`text-sm ${descriptionText}`}>
                            Monthly Earnings
                          </p>
                          <p className="text-3xl font-bold text-[#00F0FF]">
                            ${earnings.monthly}
                          </p>
                        </div>
                        <BarChart3 className="w-8 h-8 text-[#00F0FF]" />
                      </div>
                    </div>

                    <div
                      className={`p-6 rounded-2xl backdrop-blur-sm ${cardBg}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`text-sm ${descriptionText}`}>
                            Yearly Earnings
                          </p>
                          <p className="text-3xl font-bold text-[#B026FF]">
                            ${earnings.yearly}
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-[#B026FF]" />
                      </div>
                    </div>

                    <div
                      className={`p-6 rounded-2xl backdrop-blur-sm ${cardBg}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className={`text-sm ${descriptionText}`}>
                            3-Year Earnings
                          </p>
                          <p className="text-3xl font-bold text-[#FF2E9F]">
                            ${earnings.threeYear}
                          </p>
                        </div>
                        <Target className="w-8 h-8 text-[#FF2E9F]" />
                      </div>
                    </div>
                  </div>

                  <p
                    className={`text-sm text-center ${descriptionText} font-montserrat`}
                  >
                    Based on average subscription value of $650 and 30%
                    commission
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 via-[#B026FF]/10 to-[#FF2E9F]/10" />
        <div className="wrapper2 w-full mx-auto px-4 relative">
          <motion.div
            variants={cardVariants}
            whileInView="visible"
            viewport={{ once: false }}
            className="max-w-5xl mx-auto rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF] via-[#B026FF] to-[#FF2E9F] opacity-90" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6 text-white">
                Ready to Start Earning?
              </h2>
              <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto font-montserrat">
                Join thousands of affiliates who are already earning recurring
                income with our program.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/affiliate/register">
                  <Button
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100 px-12 rounded-full font-semibold"
                  >
                    Join Free <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="#faq">
                  <Button
                    size="lg"
                    variant="outline"
                    className=" text-white bg-[#410c8b]  hover:bg-white/10 px-12 rounded-full"
                  >
                    Read FAQ <HelpCircle className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-50px" }}
                className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
              >
                {[
                  { label: "No Fee", value: "Free to join", icon: Gift },
                  { label: "30 Days", value: "Cookie duration", icon: Clock },
                  { label: "24/7", value: "Support", icon: Shield },
                  { label: "$50", value: "Minimum payout", icon: CreditCard },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    variants={cardVariants}
                    className="text-center"
                  >
                    <div className="text-3xl font-bold text-white">
                      {item.label}
                    </div>
                    <div className="text-sm text-white/80">{item.value}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B026FF]/5 to-transparent" />
        <div className="wrapper2 w-full mx-auto px-4 relative">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-100px" }}
            className="text-center mb-16"
          >
            <motion.div
              variants={titleVariants}
              className="flex items-center justify-center text-blue-700 mb-4"
            >
              <span
                className={`text-sm font-medium uppercase tracking-widest border ${badgeBorder} rounded-full px-4 py-1`}
              >
                FAQ
              </span>
            </motion.div>
            <motion.h2
              variants={titleVariants}
              className={`text-4xl font-bold mb-4 ${descriptionText} `}
            >
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] bg-clip-text text-transparent">
                Questions
              </span>
            </motion.h2>
            <motion.p
              variants={textVariants}
              className={`text-lg max-w-2xl mx-auto ${descriptionText} font-montserrat`}
            >
              Get answers to common questions about our affiliate program
            </motion.p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, margin: "-50px" }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {faqData.map((faq, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                whileInView="visible"
                viewport={{ once: false }}
              >
                <Card className={`backdrop-blur-sm ${cardBg}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start">
                      <div className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-xl p-3 mr-4">
                        <HelpCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg mb-3 ${titleText}`}>
                          {faq.question}
                        </h3>
                        <p className={`${descriptionText} font-montserrat`}>
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-12 relative">
        <div className="wrapper2 w-full mx-auto px-4 relative">
          <div className={`rounded-3xl backdrop-blur-sm ${cardBg} p-8 md:p-12`}>
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-8 md:mb-0 text-center md:text-left">
                <div className="flex items-center space-x-3 justify-center md:justify-start">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#00F0FF] to-[#B026FF] rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className={`text-2xl font-bold ${titleText}`}>
                      Start Earning
                      <span className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] bg-clip-text text-transparent">
                        Today
                      </span>
                    </span>
                    <p className={`mt-2 ${descriptionText} font-montserrat`}>
                      Join our growing community of successful affiliates
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/affiliate/register">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00F0FF] to-[#B026FF] hover:from-[#00F0FF] hover:to-[#B026FF]/90 text-white px-8 rounded-full"
                >
                  Start Earning Now <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
