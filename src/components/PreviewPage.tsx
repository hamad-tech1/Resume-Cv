"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { toast } from "react-toastify"
import { Header } from "./Header"
import { Footer } from "./Footer"
import { useTheme } from "../hooks/useTheme"
import { useLanguage } from "../hooks/useLanguage"
import { Loader2, Download, Eye, ArrowLeft, FileText, Sparkles, X, CreditCard, Lock, Shield } from "lucide-react"

interface LocationState {
  sessionId: string
  classicResumeUrl: string
  modernResumeUrl: string
}

// Tap Payment Modal Component
interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: () => void
  amount: number
  resumeType: 'classic' | 'modern'
  isDarkMode: boolean
  language: string
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  resumeType,
  isDarkMode,
  language
}) => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  // Format expiry date MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    if (formatted.length <= 19) {
      setCardNumber(formatted)
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value)
    if (formatted.length <= 5) {
      setExpiryDate(formatted)
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '')
    if (value.length <= 4) {
      setCvv(value)
    }
  }

  const processPayment = async () => {
    if (!cardNumber || !expiryDate || !cvv || !cardholderName) {
      toast.error(language === 'ar' ? 'يرجى ملء جميع الحقول' : 'Please fill all fields')
      return
    }

    // Basic card validation
    const cardNumberClean = cardNumber.replace(/\s/g, '')
    if (cardNumberClean.length < 13 || cardNumberClean.length > 19) {
      toast.error(language === 'ar' ? 'رقم البطاقة غير صحيح' : 'Invalid card number')
      return
    }

    const [expMonth, expYear] = expiryDate.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    if (parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
      toast.error(language === 'ar' ? 'تاريخ انتهاء البطاقة غير صحيح' : 'Invalid expiry date')
      return
    }
    
    if (parseInt(expYear) < currentYear || (parseInt(expYear) === currentYear && parseInt(expMonth) < currentMonth)) {
      toast.error(language === 'ar' ? 'البطاقة منتهية الصلاحية' : 'Card has expired')
      return
    }

    if (cvv.length < 3 || cvv.length > 4) {
      toast.error(language === 'ar' ? 'رمز الأمان غير صحيح' : 'Invalid CVV')
      return
    }
    setIsProcessing(true)

    try {
      // Simulate payment processing with realistic timing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate different payment scenarios based on card number
      const lastDigit = cardNumberClean.slice(-1)
      
      // Simulate 90% success rate (fail only if last digit is 0)
      if (lastDigit === '0') {
        throw new Error('Payment declined by bank')
      }
      
      // Simulate successful payment
      toast.success(language === 'ar' ? 'تم الدفع بنجاح!' : 'Payment successful!')
      onPaymentSuccess()
      onClose()
      
      // Reset form
      setCardNumber('')
      setExpiryDate('')
      setCvv('')
      setCardholderName('')
      
    } catch (error) {
      console.error('Payment error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Payment failed'
      
      if (errorMessage.includes('declined')) {
        toast.error(language === 'ar' ? 'تم رفض الدفع من البنك' : 'Payment declined by bank')
      } else {
        toast.error(language === 'ar' ? 'فشل في الدفع. يرجى المحاولة مرة أخرى' : 'Payment failed. Please try again')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
        isDarkMode ? 'bg-gray-900 border border-gray-800' : 'bg-white border border-gray-200'
      }`}>
        <button
          onClick={onClose}
          disabled={isProcessing}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold">
              {language === 'ar' ? 'الدفع الآمن' : 'Secure Payment'}
            </h2>
          </div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {language === 'ar' 
              ? `دفع $${amount} لتحميل السيرة الذاتية ${resumeType === 'classic' ? 'الكلاسيكية' : 'العصرية'}`
              : `Pay $${amount} to download your ${resumeType} resume`
            }
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {/* Cardholder Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {language === 'ar' ? 'اسم حامل البطاقة' : 'Cardholder Name'}
            </label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              disabled={isProcessing}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-black focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              placeholder={language === 'ar' ? 'أدخل اسم حامل البطاقة' : 'Enter cardholder name'}
            />
          </div>

          {/* Card Number */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {language === 'ar' ? 'رقم البطاقة' : 'Card Number'}
            </label>
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              disabled={isProcessing}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                  : 'bg-white border-gray-300 text-black focus:border-blue-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
              placeholder="1234 5678 9012 3456"
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry Date'}
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                disabled={isProcessing}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-black focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {language === 'ar' ? 'رمز الأمان' : 'CVV'}
              </label>
              <input
                type="text"
                value={cvv}
                onChange={handleCvvChange}
                disabled={isProcessing}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-black focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20`}
                placeholder="123"
              />
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="flex items-center justify-center gap-2 mb-6 text-green-600">
          <Shield className="w-4 h-4" />
          <Lock className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language === 'ar' ? 'محمي بتشفير SSL 256-bit' : '256-bit SSL Encrypted'}
          </span>
        </div>

        {/* Supported Cards */}
        <div className="flex justify-center gap-2 mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{language === 'ar' ? 'البطاقات المدعومة:' : 'Supported:'}</span>
            <span className="font-semibold">VISA</span>
            <span className="font-semibold">MasterCard</span>
            <span className="font-semibold">AMEX</span>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={processPayment}
          disabled={isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName}
          className={`w-full py-4 rounded-lg font-semibold text-white transition-all duration-200 ${
            isProcessing || !cardNumber || !expiryDate || !cvv || !cardholderName
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              <span>{language === 'ar' ? `ادفع $${amount}` : `Pay $${amount}`}</span>
            </div>
          )}
        </button>

        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-2xl">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium">
                {language === 'ar' ? 'جاري معالجة الدفع...' : 'Processing payment...'}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {language === 'ar' ? 'يرجى عدم إغلاق هذه النافذة' : 'Please do not close this window'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export const PreviewPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as LocationState
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { language, toggleLanguage } = useLanguage()
  const [isLoading, setIsLoading] = useState(true)
  const [classicPdfUrl, setClassicPdfUrl] = useState<string>("")
  const [modernPdfUrl, setModernPdfUrl] = useState<string>("")
  const [activePreview, setActivePreview] = useState<"classic" | "modern">("classic")
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedResumeType, setSelectedResumeType] = useState<'classic' | 'modern'>('classic')
  const [paymentAmount] = useState(10) // Set your price here

  // Page initialization effect
  useEffect(() => {
    // Any necessary initialization can go here
  }, [language])

  // Redirect to home if no state is available
  useEffect(() => {
    if (!state || !state.sessionId) {
      toast.error(language === "ar" ? "لم يتم العثور على معلومات السيرة الذاتية" : "Resume information not found")
      navigate("/")
    }
  }, [state, navigate, language])

  useEffect(() => {
    const downloadResumes = async () => {
      try {
        const API_BASE_URL = "https://ai.cvaluepro.com/resume"

        // Download Classic Resume
        const classicResponse = await axios.get(
          `${API_BASE_URL}/download?session_id=${state.sessionId}&filename=${state.classicResumeUrl}`,
          {
            responseType: "blob",
            headers: {
            
              Accept: "application/pdf",
            },
          },
        )

        const classicBlob = new Blob([classicResponse.data], { type: "application/pdf" })
        const classicUrl = URL.createObjectURL(classicBlob)
        // Add parameters to hide PDF controls but allow scrolling
        setClassicPdfUrl(`${classicUrl}#toolbar=0&navpanes=0&view=FitH`)

        // Download Modern Resume
        const modernResponse = await axios.get(
          `${API_BASE_URL}/download?session_id=${state.sessionId}&filename=${state.modernResumeUrl}`,
          {
            responseType: "blob",
            headers: {
            
              Accept: "application/pdf",
            },
          },
        )
        const modernBlob = new Blob([modernResponse.data], { type: "application/pdf" })
        const modernUrl = URL.createObjectURL(modernBlob)
        // Add parameters to hide PDF controls but allow scrolling
        setModernPdfUrl(`${modernUrl}#toolbar=0&navpanes=0&view=FitH`)

        setIsLoading(false)
      } catch (error) {
        console.error("Error downloading resumes:", error)
        toast.error(language === "ar" ? "حدث خطأ في تحميل السير الذاتية" : "Error loading resumes")
        setIsLoading(false)
      }
    }

    if (state?.sessionId) {
      downloadResumes()
    }

    // Cleanup function to revoke object URLs
    return () => {
      if (classicPdfUrl) URL.revokeObjectURL(classicPdfUrl.split("#")[0])
      if (modernPdfUrl) URL.revokeObjectURL(modernPdfUrl.split("#")[0])
    }
  }, [state])

  const downloadPdf = (url: string, filename: string) => {
    const link = document.createElement("a")
    // Remove the hash parameters for download
    link.href = url.split("#")[0]
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadClick = (resumeType: 'classic' | 'modern') => {
    setSelectedResumeType(resumeType)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = () => {
    const url = selectedResumeType === 'classic' ? classicPdfUrl : modernPdfUrl
    const filename = `${selectedResumeType}-resume.pdf`
    
    // Download the file
    downloadPdf(url, filename)
    
    // Show success message
    toast.success(language === 'ar' ? 'تم الدفع بنجاح! جاري تحميل السيرة الذاتية...' : 'Payment successful! Downloading your resume...')
    
    // Redirect to home page after successful payment and download
    setTimeout(() => {
      toast.success(language === 'ar' ? 'شكراً لك! ستتم إعادة توجيهك إلى الصفحة الرئيسية' : 'Thank you! Redirecting to home page...')
      navigate("/", { replace: true })
    }, 2000)
  }

  const handleBackClick = () => {
    navigate("/", { replace: true })
  }

  // Determine font family class based on language
  const fontFamilyClass = language === "ar" ? "font-riwaya" : "font-hagrid"

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDarkMode
          ? "bg-gradient-to-br from-black via-gray-900 to-black text-white"
          : "bg-gradient-to-br from-white via-gray-50 to-white text-black"
      } ${fontFamilyClass}`}
    >
      <Header
        isDarkMode={isDarkMode}
        language={language}
        toggleDarkMode={toggleDarkMode}
        toggleLanguage={toggleLanguage}
      />

      <main className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <div className="mt-10">
          <button
            onClick={handleBackClick}
            className={`group flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isDarkMode
                ? "bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-600"
                : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow"
            }`}
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">{language === "ar" ? "العودة" : "Back"}</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Eye className="w-8 h-8" />
            <h1 className="text-4xl font-bold">{language === "ar" ? "معاينة السيرة الذاتية" : "Resume Preview"}</h1>
          </div>
          <p className={`text-lg max-w-2xl mx-auto ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            {language === "ar"
              ? "اختر النموذج المفضل لديك وقم بتحميله"
              : "Choose your preferred template and download it"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div
              className={`relative p-8 rounded-2xl ${
                isDarkMode ? "bg-gray-900/50 border border-gray-800" : "bg-white/80 border border-gray-200 shadow-xl"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-gray-400" />
                  <div
                    className="absolute inset-0 w-16 h-16 rounded-full border-2 border-transparent border-t-current animate-spin"
                    style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
                  />
                </div>
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">
                    {language === "ar" ? "جاري التحضير..." : "Preparing Your Resumes..."}
                  </h3>
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {language === "ar"
                      ? "نقوم بإعداد سيرتك الذاتية بأفضل جودة"
                      : "We're crafting your resumes with the highest quality"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Desktop View - Side by Side */}
            <div className="hidden lg:grid lg:grid-cols-2 gap-8">
              {/* Classic Resume */}
              <div
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-900/50 border border-gray-800 hover:border-gray-700"
                    : "bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
                }`}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6" />
                      <h2 className="text-2xl font-bold">
                        {language === "ar" ? "النموذج الكلاسيكي" : "Classic Template"}
                      </h2>
                    </div>
                    <button
                      onClick={() => handleDownloadClick('classic')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isDarkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span className="font-medium">{language === "ar" ? `تحميل - $${paymentAmount}` : `Download - $${paymentAmount}`}</span>
                    </button>
                  </div>
                  <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {language === "ar"
                      ? "تصميم أنيق ومهني للوظائف التقليدية"
                      : "Clean and professional design for traditional roles"}
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <div
                    className={`w-full h-[700px] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      isDarkMode
                        ? "border-gray-700 group-hover:border-gray-600"
                        : "border-gray-200 group-hover:border-gray-300"
                    }`}
                  >
                    <iframe 
                      src={classicPdfUrl} 
                      className="w-full h-full border-0" 
                      title="Classic Resume"
                    />
                  </div>
                </div>
              </div>

              {/* Modern Resume */}
              <div
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-900/50 border border-gray-800 hover:border-gray-700"
                    : "bg-white border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
                }`}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-6 h-6" />
                      <h2 className="text-2xl font-bold">{language === "ar" ? "النموذج العصري" : "Modern Template"}</h2>
                    </div>
                    <button
                      onClick={() => handleDownloadClick('modern')}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isDarkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span className="font-medium">{language === "ar" ? `تحميل - $${paymentAmount}` : `Download - $${paymentAmount}`}</span>
                    </button>
                  </div>
                  <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {language === "ar"
                      ? "تصميم معاصر وإبداعي للوظائف الحديثة"
                      : "Contemporary and creative design for modern roles"}
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <div
                    className={`w-full h-[700px] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      isDarkMode
                        ? "border-gray-700 group-hover:border-gray-600"
                        : "border-gray-200 group-hover:border-gray-300"
                    }`}
                  >
                    <iframe 
                      src={modernPdfUrl} 
                      className="w-full h-full border-0" 
                      title="Modern Resume"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet View - Tabbed Interface */}
            <div className="lg:hidden">
              {/* Tab buttons */}
              <div className="flex rounded-lg overflow-hidden mb-6">
                <button
                  onClick={() => setActivePreview("classic")}
                  className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
                    activePreview === "classic"
                      ? isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-black text-white"
                      : isDarkMode
                      ? "bg-gray-900/50 text-gray-400 hover:bg-gray-800/50"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{language === "ar" ? "كلاسيكي" : "Classic"}</span>
                  </div>
                </button>
                <button
                  onClick={() => setActivePreview("modern")}
                  className={`flex-1 py-4 px-6 font-medium transition-all duration-200 ${
                    activePreview === "modern"
                      ? isDarkMode
                        ? "bg-gray-800 text-white"
                        : "bg-black text-white"
                      : isDarkMode
                      ? "bg-gray-900/50 text-gray-400 hover:bg-gray-800/50"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{language === "ar" ? "عصري" : "Modern"}</span>
                  </div>
                </button>
              </div>

              {/* Active preview content */}
              <div
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-900/50 border border-gray-800"
                    : "bg-white border border-gray-200 shadow-lg"
                }`}
              >
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {activePreview === "classic" ? (
                        <FileText className="w-6 h-6" />
                      ) : (
                        <Sparkles className="w-6 h-6" />
                      )}
                      <h2 className="text-2xl font-bold">
                        {activePreview === "classic"
                          ? language === "ar"
                            ? "النموذج الكلاسيكي"
                            : "Classic Template"
                          : language === "ar"
                          ? "النموذج العصري"
                          : "Modern Template"}
                      </h2>
                    </div>
                    <button
                      onClick={() => handleDownloadClick(activePreview)}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                        isDarkMode ? "bg-white text-black hover:bg-gray-100" : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      <Download className="w-4 h-4" />
                      <span className="font-medium">{language === "ar" ? `تحميل - $${paymentAmount}` : `Download - $${paymentAmount}`}</span>
                    </button>
                  </div>
                  <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    {activePreview === "classic"
                      ? language === "ar"
                        ? "تصميم أنيق ومهني للوظائف التقليدية"
                        : "Clean and professional design for traditional roles"
                      : language === "ar"
                      ? "تصميم معاصر وإبداعي للوظائف الحديثة"
                      : "Contemporary and creative design for modern roles"}
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <div
                    className={`w-full h-[500px] rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      isDarkMode
                        ? "border-gray-700"
                        : "border-gray-200"
                    }`}
                  >
                    <iframe 
                      src={activePreview === "classic" ? classicPdfUrl : modernPdfUrl} 
                      className="w-full h-full border-0" 
                      title={`${activePreview === "classic" ? "Classic" : "Modern"} Resume`}
                    />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={paymentAmount}
        resumeType={selectedResumeType}
        isDarkMode={isDarkMode}
        language={language}
      />

      <Footer isDarkMode={isDarkMode} language={language} />
    </div>
  )
}