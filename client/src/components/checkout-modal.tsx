import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useNotification } from "@/components/notification-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckoutFormData } from "@/lib/types";
import { CreditCard, Building, Truck, User, MapPin, Phone, Mail, X } from "lucide-react";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos"),
  shippingAddress: z.string().min(10, "La dirección debe ser más específica"),
  city: z.string().min(2, "La ciudad es requerida"),
  zipCode: z.string().min(5, "Código postal inválido"),
  paymentMethod: z.enum(["card", "paypal", "transfer"], {
    required_error: "Selecciona un método de pago",
  }),
});

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { cart, totals, clearCart } = useCart();
  const { showNotification } = useNotification();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
      city: "",
      zipCode: "",
      paymentMethod: "card",
    },
  });

  const steps = [
    { id: 1, name: "Información Personal", icon: User },
    { id: 2, name: "Dirección de Envío", icon: MapPin },
    { id: 3, name: "Pago", icon: CreditCard },
  ];

  const paymentMethods = [
    { id: "card", name: "Tarjeta de Crédito/Débito", icon: CreditCard },
    { id: "paypal", name: "PayPal", icon: Building },
    { id: "transfer", name: "Transferencia Bancaria", icon: Building },
  ];

  const handleClose = () => {
    setCurrentStep(1);
    form.reset();
    onClose();
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart?.items || cart.items.length === 0) {
      showNotification("El carrito está vacío", "error");
      return;
    }

    setIsProcessing(true);

    try {
      const orderItems = cart.items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productPrice: item.product.price,
        quantity: item.quantity,
      }));

      const response = await apiRequest("POST", "/api/checkout", {
        ...data,
        items: orderItems,
      });

      const result = await response.json();

      showNotification("¡Pedido confirmado! Recibirás un email de confirmación.", "success");
      handleClose();
      clearCart();
    } catch (error) {
      console.error("Checkout error:", error);
      showNotification("Error al procesar el pedido. Inténtalo de nuevo.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `$${numPrice.toLocaleString()}`;
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const validateCurrentStep = async () => {
    let fieldsToValidate: (keyof CheckoutFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = ["customerName", "customerEmail", "customerPhone"];
        break;
      case 2:
        fieldsToValidate = ["shippingAddress", "city", "zipCode"];
        break;
      case 3:
        fieldsToValidate = ["paymentMethod"];
        break;
    }

    const isValid = await form.trigger(fieldsToValidate);
    return isValid;
  };

  const handleNextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      nextStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">Finalizar Compra</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    isCompleted 
                      ? "bg-green-500 text-white" 
                      : isCurrent 
                      ? "bg-primary text-white" 
                      : "bg-gray-200 text-gray-600"
                  }`}>
                    {isCompleted ? "✓" : step.id}
                  </div>
                  <span className={`ml-2 font-medium ${
                    isCurrent ? "text-primary" : "text-gray-600"
                  }`}>
                    {step.name}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4 h-0.5 bg-gray-200"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Formulario */}
          <div className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Step 1: Información Personal */}
                {currentStep === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Información Personal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Ingresa tu nombre completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Dirección de Envío */}
                {currentStep === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <MapPin className="h-5 w-5 mr-2" />
                        Dirección de Envío
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="shippingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección completa</FormLabel>
                            <FormControl>
                              <Input placeholder="Calle, número, colonia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ciudad</FormLabel>
                              <FormControl>
                                <Input placeholder="Ciudad" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="zipCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Código Postal</FormLabel>
                              <FormControl>
                                <Input placeholder="12345" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Método de Pago */}
                {currentStep === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        Método de Pago
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {paymentMethods.map((method) => {
                                  const MethodIcon = method.icon;
                                  return (
                                    <div key={method.id} className="flex items-center space-x-2">
                                      <RadioGroupItem value={method.id} id={method.id} />
                                      <label
                                        htmlFor={method.id}
                                        className="flex items-center cursor-pointer flex-1"
                                      >
                                        <MethodIcon className="h-4 w-4 mr-2 text-gray-600" />
                                        {method.name}
                                      </label>
                                    </div>
                                  );
                                })}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                )}
              </form>
            </Form>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                Anterior
              </Button>
              
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  disabled={isProcessing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <>
                      <div className="spinner mr-2" />
                      Procesando...
                    </>
                  ) : (
                    "Confirmar Pedido"
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                
                {/* Productos */}
                <div className="space-y-3 mb-4">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Cantidad: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-medium">
                        {formatPrice(parseFloat(item.product.price) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totales */}
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatPrice(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío:</span>
                    <span>{totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Impuestos (10%):</span>
                    <span>{formatPrice(totals.taxes)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>{formatPrice(totals.total)}</span>
                  </div>
                </div>

                {/* Información de entrega */}
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 text-primary mr-2" />
                    <span className="text-sm font-medium text-primary">
                      Entrega estimada: 3-5 días hábiles
                    </span>
                  </div>
                  {totals.shipping === 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      ¡Envío gratuito por compra superior a $1,000!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
