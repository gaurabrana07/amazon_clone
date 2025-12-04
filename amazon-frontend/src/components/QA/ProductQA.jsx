import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  ChatBubbleLeftRightIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';

const ProductQA = ({ productId }) => {
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  
  const [questions, setQuestions] = useState([]);
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerTexts, setAnswerTexts] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // recent, helpful, answered
  const [filterBy, setFilterBy] = useState('all'); // all, answered, unanswered
  const [isLoading, setIsLoading] = useState(false);

  // Sample Q&A data
  const sampleQuestions = [
    {
      id: 1,
      productId: 1,
      question: "What's the battery life like during heavy gaming sessions?",
      askedBy: "GamerPro23",
      askedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      helpful: 8,
      answers: [
        {
          id: 1,
          answer: "I've been using this phone for gaming for about 3 months now. During heavy gaming sessions (like PUBG, Call of Duty), I get around 4-5 hours of continuous gameplay. The 120Hz display does drain the battery faster, but the performance is absolutely worth it. I usually charge it once during the day if I'm gaming heavily.",
          answeredBy: "TechReviewer2024",
          answeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          helpful: 12,
          isVerifiedPurchase: true,
          userHelpful: null
        },
        {
          id: 2,
          answer: "For me, it depends on the game and settings. With graphics on high, I get about 3-4 hours. On medium settings, it can go up to 6 hours. The fast charging is really good though - 0 to 80% in about 30 minutes.",
          answeredBy: "MobileGamer",
          answeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          helpful: 6,
          isVerifiedPurchase: true,
          userHelpful: null
        }
      ],
      userHelpful: null
    },
    {
      id: 2,
      productId: 1,
      question: "Is the camera good for night photography? How does it compare to iPhone 15 Pro?",
      askedBy: "PhotoEnthusiast",
      askedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      helpful: 15,
      answers: [
        {
          id: 3,
          answer: "The night mode is impressive! I've compared it side by side with my friend's iPhone 15 Pro, and while the iPhone has slightly better noise reduction, this phone captures more detail in shadows. The new Night Vision mode is particularly good for landscape shots. For the price difference, I'd say this phone wins.",
          answeredBy: "CameraGeek",
          answeredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          helpful: 18,
          isVerifiedPurchase: true,
          userHelpful: null
        }
      ],
      userHelpful: null
    },
    {
      id: 3,
      productId: 1,
      question: "Does this phone support 5G? What about international roaming?",
      askedBy: "Traveler123",
      askedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      helpful: 3,
      answers: [],
      userHelpful: null
    },
    {
      id: 4,
      productId: 1,
      question: "How's the build quality? Is it durable for everyday use?",
      askedBy: "PracticalUser",
      askedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      helpful: 7,
      answers: [
        {
          id: 4,
          answer: "I've had mine for 6 months now and it's holding up great. Dropped it a few times (with case) and no issues. The screen is quite scratch-resistant. The metal frame feels premium and solid.",
          answeredBy: "LongTimeUser",
          answeredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          helpful: 9,
          isVerifiedPurchase: true,
          userHelpful: null
        }
      ],
      userHelpful: null
    }
  ];

  useEffect(() => {
    // Load Q&A data for the product
    const productQuestions = sampleQuestions.filter(q => q.productId === productId);
    setQuestions(productQuestions);
  }, [productId]);

  const handleAskQuestion = async () => {
    if (!isAuthenticated) {
      showNotification('Please login to ask a question', 'error');
      return;
    }

    if (!newQuestion.trim()) {
      showNotification('Please enter your question', 'error');
      return;
    }

    if (newQuestion.length < 10) {
      showNotification('Question should be at least 10 characters long', 'error');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const questionData = {
        id: Date.now(),
        productId: parseInt(productId),
        question: newQuestion.trim(),
        askedBy: user.name,
        askedAt: new Date(),
        helpful: 0,
        answers: [],
        userHelpful: null
      };

      setQuestions(prev => [questionData, ...prev]);
      setNewQuestion('');
      setShowAskQuestion(false);
      setIsLoading(false);
      showNotification('Question posted successfully!', 'success');
    }, 1000);
  };

  const handleAnswerQuestion = async (questionId) => {
    if (!isAuthenticated) {
      showNotification('Please login to answer questions', 'error');
      return;
    }

    const answerText = answerTexts[questionId]?.trim();
    if (!answerText) {
      showNotification('Please enter your answer', 'error');
      return;
    }

    if (answerText.length < 20) {
      showNotification('Answer should be at least 20 characters long', 'error');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const answerData = {
        id: Date.now(),
        answer: answerText,
        answeredBy: user.name,
        answeredAt: new Date(),
        helpful: 0,
        isVerifiedPurchase: user.verifiedPurchases?.includes(productId) || Math.random() > 0.5,
        userHelpful: null
      };

      setQuestions(prev => prev.map(q => 
        q.id === questionId 
          ? { ...q, answers: [answerData, ...q.answers] }
          : q
      ));

      setAnswerTexts(prev => ({ ...prev, [questionId]: '' }));
      setIsLoading(false);
      showNotification('Answer posted successfully!', 'success');
    }, 1000);
  };

  const handleHelpfulVote = (questionId, answerId = null, isHelpful) => {
    if (!isAuthenticated) {
      showNotification('Please login to vote', 'error');
      return;
    }

    setQuestions(prev => prev.map(question => {
      if (question.id === questionId) {
        if (answerId) {
          // Voting on an answer
          return {
            ...question,
            answers: question.answers.map(answer => {
              if (answer.id === answerId) {
                const currentVote = answer.userHelpful;
                let newHelpful = answer.helpful;
                
                if (currentVote === isHelpful) {
                  // Remove vote
                  newHelpful -= 1;
                  return { ...answer, helpful: newHelpful, userHelpful: null };
                } else if (currentVote !== null) {
                  // Change vote
                  newHelpful += isHelpful ? 2 : -2;
                  return { ...answer, helpful: newHelpful, userHelpful: isHelpful };
                } else {
                  // New vote
                  newHelpful += isHelpful ? 1 : -1;
                  return { ...answer, helpful: newHelpful, userHelpful: isHelpful };
                }
              }
              return answer;
            })
          };
        } else {
          // Voting on the question
          const currentVote = question.userHelpful;
          let newHelpful = question.helpful;
          
          if (currentVote === isHelpful) {
            newHelpful -= 1;
            return { ...question, helpful: newHelpful, userHelpful: null };
          } else if (currentVote !== null) {
            newHelpful += isHelpful ? 2 : -2;
            return { ...question, helpful: newHelpful, userHelpful: isHelpful };
          } else {
            newHelpful += isHelpful ? 1 : -1;
            return { ...question, helpful: newHelpful, userHelpful: isHelpful };
          }
        }
      }
      return question;
    }));
  };

  const filteredAndSortedQuestions = () => {
    let filtered = questions;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answers.some(a => a.answer.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Answer filter
    if (filterBy === 'answered') {
      filtered = filtered.filter(q => q.answers.length > 0);
    } else if (filterBy === 'unanswered') {
      filtered = filtered.filter(q => q.answers.length === 0);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'helpful':
          return b.helpful - a.helpful;
        case 'answered':
          return b.answers.length - a.answers.length;
        case 'recent':
        default:
          return new Date(b.askedAt) - new Date(a.askedAt);
      }
    });

    return filtered;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2" />
          Customer Q&A ({questions.length})
        </h2>
        
        <button
          onClick={() => setShowAskQuestion(!showAskQuestion)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          Ask a Question
        </button>
      </div>

      {/* Ask Question Form */}
      {showAskQuestion && (
        <div className="bg-gray-50 rounded-lg p-6 border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ask a Question</h3>
          <div className="space-y-4">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What would you like to know about this product?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {newQuestion.length}/500 characters
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAskQuestion(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskQuestion}
                  disabled={isLoading || !newQuestion.trim()}
                  className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Posting...' : 'Post Question'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions and answers..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="answered">Most Answered</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Questions</option>
            <option value="answered">Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredAndSortedQuestions().map((question) => (
          <div key={question.id} className="bg-white border rounded-lg p-6">
            {/* Question */}
            <div className="mb-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900 flex-1 mr-4">
                  {question.question}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ClockIcon className="h-4 w-4" />
                  <span>{formatTimeAgo(question.askedAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <UserIcon className="h-4 w-4" />
                  <span>Asked by {question.askedBy}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleHelpfulVote(question.id, null, true)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md text-sm transition-colors ${
                      question.userHelpful === true
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {question.userHelpful === true ? (
                      <HandThumbUpSolidIcon className="h-4 w-4" />
                    ) : (
                      <HandThumbUpIcon className="h-4 w-4" />
                    )}
                    <span>{question.helpful}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Answers */}
            {question.answers.length > 0 && (
              <div className="space-y-4 ml-4 border-l-2 border-gray-200 pl-4">
                {question.answers.map((answer) => (
                  <div key={answer.id} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-900 mb-3">{answer.answer}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <UserIcon className="h-4 w-4" />
                        <span>{answer.answeredBy}</span>
                        {answer.isVerifiedPurchase && (
                          <span className="flex items-center space-x-1 text-green-600">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Verified Purchase</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>{formatTimeAgo(answer.answeredAt)}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleHelpfulVote(question.id, answer.id, true)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                            answer.userHelpful === true
                              ? 'bg-green-100 text-green-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {answer.userHelpful === true ? (
                            <HandThumbUpSolidIcon className="h-4 w-4" />
                          ) : (
                            <HandThumbUpIcon className="h-4 w-4" />
                          )}
                          <span>{answer.helpful}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Answer Form */}
            <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4">
              <div className="space-y-3">
                <textarea
                  value={answerTexts[question.id] || ''}
                  onChange={(e) => setAnswerTexts(prev => ({
                    ...prev,
                    [question.id]: e.target.value
                  }))}
                  placeholder="Share your knowledge about this product..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                
                <div className="flex justify-end">
                  <button
                    onClick={() => handleAnswerQuestion(question.id)}
                    disabled={isLoading || !answerTexts[question.id]?.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Posting...' : 'Post Answer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredAndSortedQuestions().length === 0 && (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterBy !== 'all' ? 'No questions found' : 'No questions yet'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterBy !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Be the first to ask a question about this product!'
              }
            </p>
            {!searchQuery && filterBy === 'all' && (
              <button
                onClick={() => setShowAskQuestion(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Ask the First Question
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductQA;