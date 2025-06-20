import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, MessageCircle, FileText, Award, Users, Zap } from 'lucide-react';

const LandingPage = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Chat IA Intelligent',
      description: 'Posez des questions et obtenez des réponses personnalisées basées sur vos documents.'
    },
    {
      icon: FileText,
      title: 'Résumés Automatiques',
      description: 'Générez des résumés concis de vos documents académiques.'
    },
    {
      icon: Award,
      title: 'Quiz Adaptatifs',
      description: 'Créez des quiz personnalisés pour tester vos connaissances.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Partagez et collaborez sur vos documents avec vos collègues.'
    },
    {
      icon: Zap,
      title: 'Recommandations',
      description: 'Recevez des suggestions de ressources adaptées à votre niveau.'
    }
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            EduLLM
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Assistant IA d'Aide à l'Apprentissage - Transformez vos documents en expérience d'apprentissage interactive
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Commencer gratuitement
            </Link>
            <Link
              to="/login"
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités Puissantes
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez comment EduLLM peut améliorer votre expérience d'apprentissage
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;