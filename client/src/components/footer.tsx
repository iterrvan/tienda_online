import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Send
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Sobre Nosotros", href: "#" },
    { name: "Servicios", href: "#" },
    { name: "Testimonios", href: "#" },
    { name: "Blog", href: "#" },
    { name: "Contacto", href: "#" }
  ];

  const customerService = [
    { name: "Centro de Ayuda", href: "#" },
    { name: "Política de Devoluciones", href: "#" },
    { name: "Política de Privacidad", href: "#" },
    { name: "Términos y Condiciones", href: "#" },
    { name: "Garantías", href: "#" }
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" }
  ];

  const contactInfo = [
    { icon: MapPin, text: "Av. Principal 123, Ciudad" },
    { icon: Phone, text: "+1 (555) 123-4567" },
    { icon: Mail, text: "info@tiendaonline.com" },
    { icon: Clock, text: "Lun-Vie: 9:00 AM - 6:00 PM" }
  ];

  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white">TiendaOnline</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Tu tienda de confianza para productos de tecnología y electrónicos 
                de la mejor calidad. Más de 10 años sirviendo a nuestros clientes.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const SocialIcon = social.icon;
                  return (
                    <Button
                      key={social.name}
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-white hover:bg-gray-800 p-2"
                      asChild
                    >
                      <a href={social.href} aria-label={social.name}>
                        <SocialIcon className="h-5 w-5" />
                      </a>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Atención al Cliente</h4>
              <ul className="space-y-2">
                {customerService.map((service) => (
                  <li key={service.name}>
                    <a
                      href={service.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white">Contacto</h4>
              <div className="space-y-3">
                {contactInfo.map((contact, index) => {
                  const ContactIcon = contact.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 text-gray-300 text-sm">
                      <ContactIcon className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                      <span>{contact.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 py-8">
          <div className="max-w-md mx-auto text-center lg:text-left lg:max-w-full">
            <div className="lg:flex lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Suscríbete a nuestro newsletter
                </h4>
                <p className="text-gray-300 text-sm">
                  Recibe ofertas exclusivas y las últimas novedades
                </p>
              </div>
              
              <div className="flex max-w-md mx-auto lg:mx-0">
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="rounded-r-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-primary"
                />
                <Button 
                  type="submit"
                  className="rounded-l-none bg-primary hover:bg-primary/90 px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center md:text-left">
            <p className="text-gray-300 text-sm">
              © {currentYear} TiendaOnline. Todos los derechos reservados.
            </p>
            
            <div className="flex items-center justify-center md:justify-end space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Términos de Servicio
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Política de Privacidad
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-sm transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
