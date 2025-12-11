import { useState, useEffect } from "react";
import {
    Calendar,
    Play,
    Lightbulb,
    Smartphone,
    Shield,
    Gift,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import medsyncBg from "../assets/medsync-bg.jpg";

export default function LandingPage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const services = [
        { name: "Medical Consultations", color: "bg-[#790081]" },
        { name: "Laboratory Services", color: "bg-[#790081]" },
        { name: "Family Planning Services", color: "bg-[#790081]" },
        { name: "Pharmacy", color: "bg-[#790081]" },
        { name: "Obstetrics", color: "bg-[#790081]" },
        { name: "Dental Services", color: "bg-[#790081]" },
        { name: "TB DOTs Services", color: "bg-[#790081]" },
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
            <nav className="bg-[#B52DB5] shadow-md px-6 py-4 fixed top-0 left-0 w-full z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                            <span className="text-[#B52DB5] font-bold text-xl">M</span>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-wide">
                            MedSync
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#about" className="text-white hover:text-purple-100 transition-colors">
                            About
                        </a>
                        <a href="#services" className="text-white hover:text-purple-100 transition-colors">
                            Services
                        </a>
                        <a href="#contact" className="text-white hover:text-purple-100 transition-colors">
                            Contact
                        </a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="text-white hover:text-purple-100 transition-colors">Sign In</button>
                        <button className="bg-white text-[#B52DB5] px-6 py-2 rounded-lg hover:bg-purple-50 transition-colors font-semibold">
                            Book Now
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-purple-50 via-white to-purple-50 px-6 py-24 mt-20">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                                Smart Medical{" "}
                                <span className="text-[#B52DB5]">Appointments & Queue</span>{" "}
                                Management
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                Skip the waiting room. Book appointments, manage your queue
                                position, and receive real-time updates with our intelligent
                                medical scheduling system.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <button className="bg-[#B52DB5] text-white px-8 py-4 rounded-lg flex items-center gap-2 hover:bg-[#790081] transition-all shadow-lg hover:shadow-xl font-semibold">
                                    <Calendar size={20} />
                                    Get Started
                                </button>
                                <button className="border-2 border-[#B52DB5] text-[#B52DB5] px-8 py-4 rounded-lg flex items-center gap-2 hover:bg-purple-50 transition-all font-semibold">
                                    <Play size={20} />
                                    Watch Demo
                                </button>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-[#B52DB5] to-[#790081] rounded-3xl h-96 flex items-center justify-center shadow-2xl">
                            <div className="text-white text-center p-8">
                                <Calendar size={80} className="mx-auto mb-4 opacity-80" />
                                <p className="text-xl font-semibold">Smart Scheduling System</p>
                            </div>
                        </div>
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
                                <div className="bg-blue-500 text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
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
                                <div className="bg-green-500 text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
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
                                <div className="bg-[#B52DB5] text-white w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2">HIPAA Compliant</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        Your medical information is protected with enterprise-grade
                                        security measures.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl h-96 flex items-center justify-center shadow-xl overflow-hidden relative">
                            <img
                                src={medsyncBg}
                                alt="MedSync Background"
                                className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                            />
                            {/* Optional overlay */}
                            <div className="absolute inset-0 bg-black/20 rounded-3xl"></div>
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

                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {/* Appointment Booking Card */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border-t-4 border-[#B52DB5] hover:shadow-2xl transition-shadow">
                            <div className="bg-[#B52DB5] text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
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

                            <button className="w-full bg-[#B52DB5] text-white py-4 rounded-xl hover:bg-[#790081] transition-all font-semibold shadow-lg hover:shadow-xl">
                                Start Booking
                            </button>
                        </div>

                        {/* Efficient Queuing Card */}
                        <div className="bg-white rounded-3xl shadow-xl p-10 border-t-4 border-green-500 hover:shadow-2xl transition-shadow">
                            <div className="bg-green-500 text-white w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
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

                            <button className="w-full bg-green-500 text-white py-4 rounded-xl hover:bg-green-600 transition-all font-semibold shadow-lg hover:shadow-xl">
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
                                                        className="relative rounded-2xl overflow-hidden h-72 bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg hover:shadow-xl transition-shadow"
                                                    >
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Gift size={80} className="text-[#B52DB5] opacity-20" />
                                                        </div>
                                                        <div
                                                            className={`absolute bottom-0 left-0 right-0 ${service.color} text-white p-8`}
                                                        >
                                                            <h3 className="text-2xl font-bold">
                                                                {service.name}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <button
                            onClick={prevSlide}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full p-4 shadow-xl hover:bg-gray-50 transition-all"
                        >
                            <ChevronLeft size={28} className="text-[#B52DB5]" />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full p-4 shadow-xl hover:bg-gray-50 transition-all"
                        >
                            <ChevronRight size={28} className="text-[#B52DB5]" />
                        </button>

                        {/* Dots Indicator */}
                        <div className="flex justify-center gap-3 mt-10">
                            {Array.from({ length: Math.ceil(services.length / 2) }).map(
                                (_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-3 rounded-full transition-all ${currentSlide === index
                                                ? "bg-[#B52DB5] w-10"
                                                : "bg-gray-300 w-3"
                                            }`}
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-[#B52DB5] to-[#790081] px-6 py-24">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        Ready to Transform Your Healthcare Experience?
                    </h2>
                    <p className="text-purple-100 text-xl mb-10 leading-relaxed">
                        Join thousands of patients who have already simplified their medical
                        appointments with MedSync.
                    </p>
                    <button className="bg-white text-[#B52DB5] px-10 py-5 rounded-xl hover:bg-purple-50 transition-all font-bold text-lg shadow-2xl hover:shadow-xl">
                        Get Started Today
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#704B73] text-white px-8 py-16">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-[#B52DB5] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">M</span>
                                </div>
                                <span className="text-2xl font-bold">MedSync</span>
                            </div>
                            <p className="text-purple-200 leading-relaxed">
                                Making healthcare more accessible through intelligent appointment
                                and queue management solutions.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Services</h4>
                            <ul className="space-y-3 text-purple-200">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Appointment Booking
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Queue Management
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Patient Portal
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Provider Dashboard
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Company</h4>
                            <ul className="space-y-3 text-purple-200">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        About Us
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Press
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-lg mb-4">Support</h4>
                            <ul className="space-y-3 text-purple-200">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        HIPAA Compliance
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-purple-600 pt-8 text-center text-purple-200">
                        <p>© 2024 MedSync. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}