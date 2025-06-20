import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Upload, 
  FileText, 
  Award,
  Star,
  TrendingUp,
  Users,
  BookOpen,
  Calendar,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/chat/history?profile_id=${user.profile_id}&user_id=${user.user_id}`
      );
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const quickActions = [
    {
      title: 'Nouveau Chat',
      description: 'Commencer une conversation avec l\'IA',
      icon: MessageCircle,
      link: '/app/chat',
      bg: 'bg-blue-500',
      hover: 'hover:bg-blue-600'
    },
    {
      title: 'Importer Document',
      description: 'Ajouter un nouveau document',
      icon: Upload,
      link: '/app/ingest',
      bg: 'bg-green-500',
      hover: 'hover:bg-green-600'
    },
    {
      title: 'Créer un Quiz',
      description: 'Générer un quiz depuis vos documents',
      icon: Award,
      link: '/app/quiz',
      bg: 'bg-purple-500',
      hover: 'hover:bg-purple-600'
    },
    {
      title: 'Résumer',
      description: 'Créer un résumé de vos documents',
      icon: FileText,
      link: '/app/summarize',
      bg: 'bg-orange-500',
      hover: 'hover:bg-orange-600'
    }
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {user?.username}!
        </h1>
        <p className="text-blue-100">
          Prêt à continuer votre apprentissage aujourd'hui?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.link}
              className={`${action.bg} ${action.hover} text-white p-6 rounded-lg transition-colors group`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className="h-8 w-8" />
                <div className="w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-sm opacity-90">{action.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Stats Overview */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-12"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_documents || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_chats || 0}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Quiz Générés</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_quizzes || 0}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
              <Link 
                to="/app/chat" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
              >
                Voir tout
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {activity.message || 'Conversation'}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.timestamp ? formatDate(activity.timestamp) : 'Récemment'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucune activité récente</p>
                <Link 
                  to="/app/chat" 
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block"
                >
                  Commencer une conversation
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Progression d'Apprentissage</h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {/* Documents Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Documents traités</span>
                  <span className="text-sm text-gray-600">{stats?.total_documents || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats?.total_documents || 0) * 10, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Quiz Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Quiz complétés</span>
                  <span className="text-sm text-gray-600">{stats?.total_quizzes || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats?.total_quizzes || 0) * 20, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Conversations Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Conversations</span>
                  <span className="text-sm text-gray-600">{stats?.total_chats || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((stats?.total_chats || 0) * 5, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Continuez comme ça! Votre progression est excellente.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              Conseil du jour
            </h4>
            <p className="text-gray-700 mb-4">
              Utilisez la fonction de résumé automatique pour créer des notes de révision efficaces à partir de vos documents.
            </p>
            <Link 
              to="/app/summarize"
              className="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
            >
              Essayer maintenant
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;