import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useForm } from 'react-hook-form';
import { Mail, Phone, MapPin, Send, Github, Facebook, Instagram, Check, AlertCircle } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const Contact: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/email/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Message sent successfully! I\'ll get back to you soon.');
        reset();
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.message || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6" />,
      label: "Email",
      value: "eushaibnaakbor@gmail.com",
      href: "mailto:eushaibnaakbor@gmail.com"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      label: "Phone",
      value: "+880 1918331878",
      href: "tel:+8801918331878"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      label: "Location",
      value: "Rajshahi, Bangladesh",
      href: "#"
    }
  ];

  const socialLinks = [
    {
      icon: <Github className="w-6 h-6" />,
      label: "GitHub",
      href: "https://github.com/Eusha122",
      color: "hover:text-gray-400"
    },
    {
      icon: <Facebook className="w-6 h-6" />,
      label: "Facebook",
      href: "https://www.facebook.com/eusha.ibna.akbor",
      color: "hover:text-blue-500"
    },
    {
      icon: <Instagram className="w-6 h-6" />,
      label: "Instagram",
      href: "https://www.instagram.com/eusha_hehe/",
      color: "hover:text-pink-400"
    }
  ];

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-poppins mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Let's Connect
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Have a project in mind or just want to chat about technology? I'd love to hear from you!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6 sm:space-y-8"
          >
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-dark-700">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Get in Touch</h3>
              
              <div className="space-y-4 sm:space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.a
                    key={info.label}
                    href={info.href}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-all duration-300 group"
                    data-cursor="pointer"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform flex-shrink-0">
                      {info.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-400 text-xs sm:text-sm">{info.label}</p>
                      <p className="text-white font-medium text-sm sm:text-base break-words">{info.value}</p>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-dark-700">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Follow Me</h3>
              <div className="flex space-x-3 sm:space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className={`w-10 h-10 sm:w-12 sm:h-12 bg-dark-700 rounded-full flex items-center justify-center text-gray-400 transition-all duration-300 ${social.color}`}
                    data-cursor="pointer"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-dark-800/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-dark-700"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Send a Message</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Message *
                </label>
                <textarea
                  {...register('message', { required: 'Message is required' })}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none text-sm sm:text-base"
                  placeholder="Tell me about your project or just say hello!"
                />
                {errors.message && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 text-sm sm:text-base"
                data-cursor="pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Send Message</span>
                  </>
                )}
              </motion.button>

              {submitStatus !== 'idle' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 sm:p-4 rounded-lg text-center flex items-center justify-center space-x-2 text-sm sm:text-base ${
                    submitStatus === 'success' 
                      ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                      : 'bg-red-500/20 border border-red-500/30 text-red-400'
                  }`}
                >
                  {submitStatus === 'success' ? (
                    <Check size={16} className="flex-shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="flex-shrink-0" />
                  )}
                  <span>{submitMessage}</span>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;