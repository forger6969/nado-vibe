import './index.css'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Categories } from './components/Categories'
import { Catalog } from './components/Catalog'
import { About } from './components/About'
import { Delivery } from './components/Delivery'
import { CTASection } from './components/CTASection'
import { Footer } from './components/Footer'
import { CustomCursor } from './components/CustomCursor'
import { ScrollProgress } from './components/ScrollProgress'
import { PageEntrance } from './components/PageEntrance'

export default function App() {
  return (
    <>
      <PageEntrance />
      <CustomCursor />
      <ScrollProgress />
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <Categories />
          <Catalog />
          <About />
          <Delivery />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  )
}
