import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Calendar,
    Lightbulb,
    Smartphone,
    Shield,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Clock,
    Users,
    Zap,
    Bell,
    ArrowRight,
} from "lucide-react";
import medsyncBg from "../assets/medsync-bg.jpg";
import logo from "../assets/medsync-logo.png";
import dentalImg from "../assets/dental.jpeg";
import famplanImg from "../assets/famplan.jpeg";
import labImg from "../assets/lab.jpg";
import medconsImg from "../assets/medcons.jpg";
import obImg from "../assets/ob.jpg";
import pharmaImg from "../assets/pharma.jpg";
import tbdotsImg from "../assets/tbdots.jpg";

// Smart Scheduling Carousel Component
function SmartSchedulingCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const features = [
        { 
            icon: Calendar, 
            title: "Smart Scheduling",
            description: "Intelligent calendar management that adapts to your workflow",
            image: dentalImg
        },
        { 
            icon: Clock, 
            title: "Time Optimization",
            description: "AI-powered algorithms find the perfect meeting times for everyone",
            image: famplanImg
        },
        { 
            icon: Users, 
            title: "Team Sync",
            description: "Seamlessly coordinate across teams and time zones",
            image: labImg
        },
        { 
            icon: Zap, 
            title: "Instant Resolution",
            description: "Automatic conflict detection and smart resolution suggestions",
            image: medconsImg
        },
        { 
            icon: CheckCircle, 
            title: "Auto-Confirmation",
            description: "Smart reminders and automatic meeting confirmations",
            image: obImg
        },
        { 
            icon: Bell, 
            title: "Smart Notifications",
            description: "Context-aware alerts that keep you informed, not overwhelmed",
            image: pharmaImg
        }
    ];

    useEffect(() => {
        if (isPaused) return;
        
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % features.length);
        }, 3500);

        return () => clearInterval(interval);
    }, [isPaused, features.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % features.length);
    };

    const CurrentIcon = features[currentIndex].icon;

    return (
        <div 
            className="relative bg-gradient-to-br from-[#5996EC] to-[#4785DB] rounded-3xl h-96 flex items-center justify-center shadow-2xl overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ 
                        backgroundImage: `url(${features[currentIndex].image})`,
                        filter: 'brightness(0.4) blur(2px)'
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#5996EC]/60 to-[#4785DB]/60" />
            </div>

            {/* Animated Accent Elements */}
            <div className="absolute inset-0 opacity-20">
                <div 
                    className="absolute top-10 right-10 w-32 h-32 border-2 border-white rounded-full transition-all duration-1000"
                    style={{ 
                        transform: `scale(${1 + currentIndex * 0.1}) rotate(${currentIndex * 30}deg)`,
                        opacity: 0.3
                    }}
                />
                <div 
                    className="absolute bottom-10 left-10 w-40 h-40 border-2 border-white rounded-full transition-all duration-1000"
                    style={{ 
                        transform: `scale(${1 + currentIndex * 0.08}) rotate(-${currentIndex * 25}deg)`,
                        opacity: 0.3
                    }}
                />
            </div>

            {/* Carousel Content */}
            <div className="relative z-10 text-white text-center p-12 max-w-lg">
                <div 
                    key={currentIndex}
                    style={{
                        animation: 'fadeIn 0.6s ease-out'
                    }}
                >
                    {/* Icon with pulse animation */}
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
                        <div className="relative bg-white/20 backdrop-blur-md p-6 rounded-full border-2 border-white/30 shadow-2xl">
                            <CurrentIcon size={64} className="drop-shadow-lg" />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 
                        className="text-3xl font-bold mb-4 drop-shadow-lg"
                        style={{
                            animation: 'slideUp 0.6s ease-out both'
                        }}
                    >
                        {features[currentIndex].title}
                    </h3>

                    {/* Description */}
                    <p 
                        className="text-lg leading-relaxed backdrop-blur-sm bg-white/10 rounded-2xl p-4 shadow-lg"
                        style={{
                            animation: 'slideUp 0.6s ease-out 0.1s both'
                        }}
                    >
                        {features[currentIndex].description}
                    </p>

                    {/* Feature Number */}
                    <div 
                        className="mt-6 text-sm font-semibold opacity-90"
                        style={{
                            animation: 'slideUp 0.6s ease-out 0.2s both'
                        }}
                    >
                        Feature {currentIndex + 1} of {features.length}
                    </div>
                </div>

                {/* Next Button */}
                <button
                    onClick={nextSlide}
                    className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/40 backdrop-blur-md p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/30 shadow-xl"
                    aria-label="Next slide"
                >
                    <ArrowRight size={24} />
                </button>
            </div>

            {/* Dots Navigation */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full">
                {features.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-300 rounded-full ${
                            index === currentIndex 
                                ? 'w-8 h-2 bg-white shadow-lg' 
                                : 'w-2 h-2 bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
                <div 
                    className="h-full bg-white shadow-lg"
                    style={{
                        animation: isPaused ? 'none' : 'progress 3.5s linear',
                        animationPlayState: isPaused ? 'paused' : 'running'
                    }}
                    key={currentIndex}
                />
            </div>

            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes progress {
                    from {
                        width: 0%;
                    }
                    to {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
}

export default function LandingPage() {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Smooth scroll to section
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offsetTop = element.offsetTop - 80; // Account for fixed navbar height
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    };

    const services = [
        { name: "Medical Consultations", color: "bg-[#790081]", img: medconsImg },
        { name: "Laboratory Services", color: "bg-[#790081]", img: labImg },
        { name: "Family Planning Services", color: "bg-[#790081]", img: famplanImg },
        { name: "Pharmacy", color: "bg-[#790081]", img: pharmaImg },
        { name: "Obstetrics", color: "bg-[#790081]", img: obImg },
        { name: "Dental Services", color: "bg-[#790081]", img: dentalImg },
        { name: "TB DOTs Services", color: "bg-[#790081]", img: tbdotsImg },
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(services.length / 2));
    };

    const prevSlide = () => {
        setCurrentSlide(
            (prev) =>
                (prev - 1 + Math.ceil(services.length / 2)) %
                Math.ceil(services.length / 2)
        );
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-gradient-to-r from-[#5996EC] to-[#4785DB] shadow-md px-6 py-4 fixed top-0 left-0 w-full z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img src={logo} alt="MedSync Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide">MedSync</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <button 
                            onClick={() => scrollToSection('about')} 
                            className="text-white hover:text-blue-100 transition-colors cursor-pointer"
                        >
                            About
                        </button>
                        <button 
                            onClick={() => scrollToSection('services')} 
                            className="text-white hover:text-blue-100 transition-colors cursor-pointer"
                        >
                            Services
                        </button>
                        <button 
                            onClick={() => scrollToSection('contact')} 
                            className="text-white hover:text-blue-100 transition-colors cursor-pointer"
                        >
                            Contact
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate("/patient/queue")}
                            className="bg-white text-[#5996EC] px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors font-semibold shadow-md"
                        >
                            Start Now
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-6 py-24 mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                Smart Medical <span className="text-[#5996EC]">Appointments & Queue</span> Management
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Skip the waiting room. Book appointments, manage your queue
                                position, and receive real-time updates with our intelligent
                                medical scheduling system.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => navigate("/patient/queue")}
                                    className="bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white px-8 py-4 rounded-lg flex items-center gap-2 hover:shadow-xl transition-all shadow-lg font-semibold"
                                >
                                    <Calendar size={20} /> Get Started
                                </button>
                            </div>
                        </div>
                        <SmartSchedulingCarousel />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="px-6 py-20 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">About MedSync</h2>
                        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                            We're revolutionizing healthcare accessibility through intelligent
                            appointment scheduling and queue management, making medical care
                            more efficient for both patients and providers.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="bg-gradient-to-br from-[#5996EC] to-[#4785DB] text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Lightbulb size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Digital appointment optimization reduces wait times and
                                        maximizes clinic efficiency.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="bg-gradient-to-br from-[#4785DB] to-[#5996EC] text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Smartphone size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Real-time Updates</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Get instant notifications about your appointment status and
                                        queue position.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-6">
                                <div className="bg-gradient-to-br from-[#5996EC] to-[#4785DB] text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">Secure & Private</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Your medical information is protected with enterprise-grade
                                        security measures.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl h-96 flex items-center justify-center shadow-xl overflow-hidden relative">
                            <img
                                src={medsyncBg}
                                alt="MedSync Background"
                                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-[#5996EC]/30 to-[#4785DB]/30 rounded-3xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="px-6 py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h2>
                        <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                            Comprehensive healthcare management solutions designed to streamline
                            your medical journey from booking to treatment.
                        </p>
                    </div>

                    {/* Appointment Booking & Efficient Queuing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* Appointment Booking Card */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border-t-4 border-[#5996EC] hover:shadow-2xl transition-shadow">
                            <div className="bg-gradient-to-br from-[#5996EC] to-[#4785DB] text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Appointment Booking</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Easy online booking with doctor availability, specialty filters,
                                and instant confirmation. Schedule follow-ups and recurring
                                appointments effortlessly.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                                    <span>Real-time availability</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                                    <span>Doctor profiles & reviews</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                                    <span>Instant confirmation</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/patient/appointments")}
                                className="w-full bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white py-4 rounded-xl hover:shadow-xl transition-all font-semibold shadow-lg"
                            >
                                Start Booking
                            </button>
                        </div>

                        {/* Efficient Queuing Card */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border-t-4 border-[#4785DB] hover:shadow-2xl transition-shadow">
                            <div className="bg-gradient-to-br from-[#4785DB] to-[#5996EC] text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                                <Smartphone size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Efficient Queuing</h3>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                No more hassle lines by promoting digital numbers to avoid
                                confusion from manually distributed number cards.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                                    <span>Real-time progress tracking</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                                    <span>Smoother queue management</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <CheckCircle size={24} className="text-green-500 flex-shrink-0" />
                                    <span>Faster processing time</span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/patient/queue")}
                                className="w-full bg-gradient-to-r from-[#4785DB] to-[#5996EC] text-white py-4 rounded-xl hover:shadow-xl transition-all font-semibold shadow-lg"
                            >
                                Join Queue
                            </button>
                        </div>
                    </div>

                    {/* Service Cards Carousel */}
                    <div className="relative mt-16">
                        <h3 className="text-3xl font-bold text-center mb-12">Medical Services Available</h3>
                        <div className="overflow-hidden rounded-2xl">
                            <div
                                className="flex transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                            >
                                {Array.from({ length: Math.ceil(services.length / 2) }).map(
                                    (_, slideIndex) => (
                                        <div
                                            key={slideIndex}
                                            className="min-w-full grid md:grid-cols-2 gap-6 px-1"
                                        >
                                            {services
                                                .slice(slideIndex * 2, slideIndex * 2 + 2)
                                                .map((service, index) => (
                                                    <div
                                                        key={index}
                                                        className="relative rounded-2xl overflow-hidden h-72 shadow-lg hover:shadow-xl transition-shadow"
                                                    >
                                                        <img
                                                            src={service.img}
                                                            alt={service.name}
                                                            className="absolute inset-0 w-full h-full object-cover"
                                                        />
                                                        <div className="absolute inset-0 bg-black/25"></div>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-[#5996EC] to-[#4785DB] text-white p-6">
                                                            <h3 className="text-2xl font-bold">{service.name}</h3>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-4 shadow-xl hover:bg-gray-50 transition-all"
                        >
                            <ChevronLeft size={28} className="text-[#5996EC]" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-4 shadow-xl hover:bg-gray-50 transition-all"
                        >
                            <ChevronRight size={28} className="text-[#5996EC]" />
                        </button>

                        <div className="flex justify-center gap-3 mt-10">
                            {Array.from({ length: Math.ceil(services.length / 2) }).map(
                                (_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-3 rounded-full transition-all ${
                                            currentSlide === index ? "bg-[#5996EC] w-10" : "bg-gray-300 w-3"
                                        }`}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="contact" className="bg-gradient-to-r from-[#5996EC] to-[#4785DB] px-6 py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Ready to Transform Your Healthcare Experience?
                    </h2>
                    <p className="text-blue-100 text-xl mb-10 leading-relaxed">
                        Join thousands of patients who have already simplified their medical
                        appointments with MedSync.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-b from-[#4785DB] to-[#3664B8] text-white px-8 py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-lg overflow-hidden">
                                    <img src={logo} alt="MedSync Logo" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-2xl font-bold">MedSync</span>
                            </div>
                            <p className="text-blue-200 leading-relaxed">
                                Making healthcare more accessible through intelligent appointment
                                and queue management solutions.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Services</h4>
                            <ul className="space-y-3 text-blue-200">
                                <li><a href="#" className="hover:text-white transition-colors">Appointment Booking</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Queue Management</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Patient Portal</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Provider Dashboard</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Company</h4>
                            <ul className="space-y-3 text-blue-200">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Contact</h4>
                            <p className="text-blue-200">123 MedSync Street, City, Country</p>
                            <p className="text-blue-200">Email: support@medsync.com</p>
                            <p className="text-blue-200">Phone: +123 456 7890</p>
                        </div>
                    </div>

                    <p className="text-center text-blue-200">© 2025 MedSync. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}