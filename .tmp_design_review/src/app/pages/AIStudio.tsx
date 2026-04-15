import { 
  ArrowLeft, 
  ArrowRight, 
  Send, 
  Sparkles, 
  FileText, 
  Calculator,
  Home,
  MessageSquare,
  Clock,
  Bookmark,
  MoreVertical,
  Plus
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

export function AIStudio() {
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(true);

  const conversations = [
    {
      id: 1,
      title: "4-Bedroom House Estimate",
      date: "2 hours ago",
      type: "estimation"
    },
    {
      id: 2,
      title: "Budget Analysis - 60M RWF",
      date: "Yesterday",
      type: "analysis"
    },
    {
      id: 3,
      title: "Modern Villa Design",
      date: "3 days ago",
      type: "design"
    },
    {
      id: 4,
      title: "Material Comparison",
      date: "1 week ago",
      type: "consultation"
    }
  ];

  const suggestions = [
    "I want to build a 3-bedroom house with a budget of 50 million RWF",
    "What's the cost difference between brick and block construction?",
    "Generate a plan for a small commercial building",
    "What can I build on a 400 sqm plot in Kigali?"
  ];

  const chatMessages = [
    {
      role: "assistant",
      content: "Hello! I'm your CivilBridge AI assistant. I can help you with construction planning, cost estimation, design ideas, and feasibility analysis. What would you like to explore today?"
    },
    {
      role: "user",
      content: "I want to build a modern 4-bedroom house in Gasabo. My budget is around 60 million RWF."
    },
    {
      role: "assistant",
      content: "Great! A 60 million RWF budget for a 4-bedroom house in Gasabo is realistic and achievable. Let me help you understand what's possible:\n\n**Feasibility Analysis:**\n✓ Budget is suitable for a quality 4-bedroom house\n✓ Estimated building size: 220-250 sqm\n✓ Construction timeline: 8-10 months\n\n**What I can do next:**\n1. Generate a detailed cost estimate\n2. Create custom design options\n3. Analyze your land requirements\n4. Connect you with verified engineers\n\nWhat would you like to explore first?"
    }
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Studio</h1>
              <p className="text-xs text-gray-500">Construction Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Export Chat
          </button>
          <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors">
            New Session
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-8">
            <div className="max-w-3xl mx-auto space-y-6">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-4 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-2xl rounded-2xl px-6 py-4 ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <p className={`whitespace-pre-line ${
                      msg.role === "user" ? "text-white" : "text-gray-800"
                    }`}>
                      {msg.content}
                    </p>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-700 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 mt-8">
                <button className="p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left">
                  <Calculator className="h-5 w-5 text-emerald-600 mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">Generate Estimate</p>
                  <p className="text-xs text-gray-500">Get detailed cost breakdown</p>
                </button>

                <button className="p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left">
                  <FileText className="h-5 w-5 text-emerald-600 mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">Create Custom Plan</p>
                  <p className="text-xs text-gray-500">AI-powered design</p>
                </button>

                <button className="p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left">
                  <Home className="h-5 w-5 text-emerald-600 mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">Browse Plans</p>
                  <p className="text-xs text-gray-500">View ready-made options</p>
                </button>

                <button className="p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all text-left">
                  <MessageSquare className="h-5 w-5 text-emerald-600 mb-2" />
                  <p className="font-semibold text-gray-900 text-sm">Find Expert</p>
                  <p className="text-xs text-gray-500">Connect with engineers</p>
                </button>
              </div>

              {/* Suggestions */}
              {chatMessages.length <= 3 && (
                <div className="mt-8">
                  <p className="text-sm text-gray-500 mb-3">Try asking:</p>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setMessage(suggestion)}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:shadow-sm transition-all text-sm text-gray-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white px-6 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3 items-end">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-200">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask anything about construction, costs, designs, or feasibility..."
                    rows={1}
                    className="w-full bg-transparent resize-none focus:outline-none text-gray-900 placeholder-gray-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        // Handle send
                      }
                    }}
                  />
                </div>
                <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2">
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI-powered construction intelligence for Rwanda. Always verify critical decisions with licensed professionals.
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar - History */}
        {showHistory && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900">History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ArrowRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
              <button className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 text-sm">
                <Plus className="h-4 w-4" />
                New Conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-1">
                        {conv.title}
                      </p>
                      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded">
                        <MoreVertical className="h-3 w-3 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{conv.date}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <button className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2">
                <Bookmark className="h-4 w-4" />
                Saved Sessions
              </button>
            </div>
          </div>
        )}

        {!showHistory && (
          <button
            onClick={() => setShowHistory(true)}
            className="absolute right-4 top-24 p-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );
}
