'use client';
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from '@/lib/brand';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Wrapper from '@/components/wrapper';
import { useSubmitContactMutation } from '@/redux/features/contactApi';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ContactPage() {
  const router = useRouter();
  const [submitContact, { isLoading: isSubmitting, error: submitError }] =
    useSubmitContactMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitMessage, setSubmitMessage] = useState('');

  // Handle input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (
      formData.phone &&
      !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = 'Subject must be at least 5 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitMessage('');

    try {
      const result = await submitContact(formData).unwrap();

      // Store success flag in sessionStorage for thank you page
      sessionStorage.setItem('contactSubmitted', 'true');
      sessionStorage.setItem('contactId', result.data.id);
      sessionStorage.setItem('contactSubmittedAt', new Date().toISOString());

      // Redirect to thank you page
      router.push('/contact/thank-you');
    } catch (error) {
      console.error('Contact form submission error:', error);

      let errorMessage = 'Failed to send message. Please try again.';

      // Handle different types of errors with user-friendly messages
      if (error?.status === 429) {
        errorMessage =
          'You have submitted too many messages recently. Please wait before submitting again.';
      } else if (error?.status === 400) {
        errorMessage =
          error?.data?.message ||
          'Please check all required fields and try again.';
      } else if (error?.status === 500) {
        errorMessage =
          'Server error occurred. Please try again or contact us directly.';
      } else if (error?.status === 0 || error?.name === 'TypeError') {
        errorMessage =
          'Connection error. Please check your internet connection and try again.';
      } else if (error?.data?.message) {
        errorMessage = error.data.message;
      }

      setSubmitMessage(errorMessage);
    }
  };

  const isError =
    submitMessage &&
    (submitMessage.includes('Failed') ||
      submitMessage.includes('error') ||
      submitMessage.includes('Error') ||
      submitMessage.includes('Connection') ||
      submitMessage.includes('Server'));

  return (
    <Wrapper>
      <div className="py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <div className="mb-8">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="/"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-foreground font-medium">
                    Contact
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get in touch with our team. We'd love to hear from you and help
              with any questions or concerns!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="order-2 lg:order-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Mail className="w-6 h-6 text-primary" />
                    Send us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">
                          Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`${errors.name ? 'border-destructive' : ''
                            }`}
                          placeholder="Your full name"
                          maxLength={100}
                        />
                        {errors.name && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className={`${errors.email ? 'border-destructive' : ''
                            }`}
                          placeholder="your.email@example.com"
                        />
                        {errors.email && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone{' '}
                          <span className="text-muted-foreground text-xs">
                            (Optional)
                          </span>
                        </Label>
                        <Input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={`${errors.phone ? 'border-destructive' : ''
                            }`}
                          placeholder="(555) 123-4567"
                        />
                        {errors.phone && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="subject"
                          className="text-sm font-medium"
                        >
                          Subject <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="text"
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`${errors.subject ? 'border-destructive' : ''
                            }`}
                          placeholder="How can we help you?"
                          maxLength={200}
                        />
                        {errors.subject && (
                          <p className="text-sm text-destructive flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className={`min-h-[120px] resize-none ${errors.message ? 'border-destructive' : ''
                          }`}
                        placeholder="Please describe your inquiry in detail..."
                        rows={6}
                        maxLength={2000}
                      />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{formData.message.length}/2000 characters</span>
                        <span>
                          {formData.message.length >= 10
                            ? '✓'
                            : 'Minimum 10 characters'}
                        </span>
                      </div>
                      {errors.message && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.message}
                        </p>
                      )}
                    </div>

                    {submitMessage && (
                      <Alert variant={isError ? 'destructive' : 'default'}>
                        {isError ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{submitMessage}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base font-medium"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Contact Information */}
            <div className="order-1 lg:order-2">
              <Card className="h-fit lg:sticky lg:top-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <MapPin className="w-6 h-6 text-primary" />
                    Get in Touch
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">Phone</h4>
                      {SUPPORT_PHONE && (
                        <a
                          href={SUPPORT_PHONE_HREF}
                          className="text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          {SUPPORT_PHONE}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">Email</h4>
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                  </div>

                  {/* No postal address is shown anywhere on this site, by decision. This block is kept only so the markup is here if that ever changes.
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">Address</h4>
                      <p className="text-muted-foreground">{ADDRESS_LINE}</p>
                    </div>
                  </div>
                  */}

                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">
                        Response Time
                      </h4>
                      <p className="text-muted-foreground">
                        We typically respond within
                        <br />
                        <span className="font-medium text-foreground">
                          24-48 hours
                        </span>{' '}
                        during business days
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Wrapper>
  );
}
