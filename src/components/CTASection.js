// src/components/CTASection.js
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Готовы начать путешествие?
        </h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
          Присоединяйтесь к тысячам путешественников, которые уже создают 
          незабываемые воспоминания с Vacation Social
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/registration" 
            className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-50 transition duration-200 shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 inline-flex items-center justify-center"
          >
            Создать аккаунт бесплатно
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          
          <Link 
            href="/features" 
            className="border border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:bg-opacity-10 transition duration-200 inline-flex items-center justify-center"
          >
            Узнать больше
          </Link>
        </div>
        
        <p className="mt-6 text-blue-200 text-sm">
          Без кредитной карты • Бесплатно навсегда
        </p>
      </div>
    </section>
  );
}
