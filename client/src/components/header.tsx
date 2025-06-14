import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/hooks/use-cart";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface HeaderProps {
  onCartToggle: () => void;
  onSearchChange: (search: string) => void;
}

export default function Header({ onCartToggle, onSearchChange }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { totalItems } = useCart();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(searchTerm);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Búsqueda en tiempo real con debounce básico
    const timeoutId = setTimeout(() => {
      onSearchChange(value);
    }, 300);
    
    return () => clearTimeout(timeoutId);
  };

  const navigation = [
    { name: "Inicio", href: "#" },
    { name: "Productos", href: "#" },
    { name: "Categorías", href: "#" },
    { name: "Ofertas", href: "#" },
    { name: "Contacto", href: "#" }
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y navegación principal */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">TiendaOnline</h1>
            </div>
            
            {/* Navegación desktop */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium"
                >
                  {item.name}
                </a>
              ))}
            </nav>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-lg mx-8 hidden lg:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 p-2 bg-transparent hover:bg-gray-100 text-gray-400 hover:text-primary"
                variant="ghost"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Carrito y acciones */}
          <div className="flex items-center space-x-4">
            
            {/* Búsqueda móvil */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Search className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-20">
                <form onSubmit={handleSearchSubmit} className="w-full mt-4">
                  <Input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full"
                    autoFocus
                  />
                </form>
              </SheetContent>
            </Sheet>

            {/* Carrito */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartToggle}
              className="relative text-gray-700 hover:text-primary"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mi Cuenta - Desktop */}
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-primary">
              <User className="h-4 w-4" />
              <span>Mi Cuenta</span>
            </Button>

            {/* Menú móvil */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-6 mt-6">
                  <h2 className="text-lg font-semibold text-primary">TiendaOnline</h2>
                  
                  <nav className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                  </nav>

                  <div className="pt-4 border-t">
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-4 w-4 mr-2" />
                      Mi Cuenta
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
