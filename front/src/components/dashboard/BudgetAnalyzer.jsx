import React, { useState, useEffect } from 'react';
import { budgetAnalysisService } from '../../services/budgetAnalysisService.js';
import { regionsService } from '../../services/regionsService.js';

export default function BudgetAnalyzer() {
  const [budget, setBudget] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [regions, setRegions] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      const response = await regionsService.getAllRegions();
      setRegions(response.regions || []);
      // Default to Kigali if available
      const kigali = response.regions?.find(r => r.name.toLowerCase().includes('kigali'));
      if (kigali) {
        setSelectedRegion(kigali.id);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
      setError('Failed to load regions');
    }
  };

  const handleAnalyze = async () => {
    if (!budget || !selectedRegion) {
      setError('Please enter budget and select region');
      return;
    }

    const budgetNum = Number(budget);
    if (budgetNum < 1000000) {
      setError('Minimum budget is 1,000,000 RWF');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const result = await budgetAnalysisService.analyzeBudget(budgetNum, selectedRegion);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis error:', error);
      setError(error.message || 'Failed to analyze budget');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ color: '#0c1220', marginBottom: '20px' }}>🏗️ Budget Analysis & Recommendations</h2>
      
      {/* Input Section */}
      <div style={{
        background: '#f7f8fb',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#3a4357' }}>
            Available Budget (RWF)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Enter your budget (e.g., 10000000)"
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #eef0f4',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#3a4357' }}>
            Region
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #eef0f4',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            <option value="">Select a region</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !budget || !selectedRegion}
          style={{
            background: loading ? '#64708a' : '#0c1220',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Budget & Get Recommendations'}
        </button>
      </div>

      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div>
          {analysis.success ? (
            <div>
              {/* AI Recommendations */}
              <div style={{
                background: '#e8f5e8',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#2d5a2d', marginBottom: '10px' }}>🤖 AI Recommendations</h3>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {analysis.recommendations?.recommendation}
                </div>
                <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  Confidence: {Math.round((analysis.recommendations?.confidence || 0) * 100)}%
                </div>
              </div>

              {/* Suitable Plans */}
              <div style={{
                background: '#f7f8fb',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h3 style={{ color: '#0c1220', marginBottom: '15px' }}>📋 Suitable Plans</h3>
                {analysis.suitable_plans?.map((plan, index) => (
                  <div key={plan.key} style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    border: index === 0 ? '2px solid #0c1220' : '1px solid #eef0f4'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#0c1220', marginBottom: '5px' }}>
                      {plan.name} {index === 0 && '(Recommended)'}
                    </div>
                    <div style={{ color: '#64708a', fontSize: '14px' }}>
                      Size: {plan.size_range.min}-{plan.size_range.max}m² | 
                      Bedrooms: {plan.bedrooms.min}-{plan.bedrooms.max} | 
                      Construction: {plan.construction_time.min}-{plan.construction_time.max} months
                    </div>
                    <div style={{ color: '#3a4357', marginTop: '5px' }}>
                      Budget range: {formatCurrency(plan.adjusted_min_budget)} - {formatCurrency(plan.adjusted_max_budget)}
                    </div>
                    <div style={{ color: '#0c1220', fontWeight: '600', marginTop: '5px' }}>
                      Affordability Score: {Math.round(plan.affordability_score * 100)}%
                    </div>
                  </div>
                ))}
              </div>

              {/* Detailed Cost Breakdown */}
              {analysis.detailed_analysis && (
                <div style={{
                  background: '#f7f8fb',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: '#0c1220', marginBottom: '15px' }}>💰 Detailed Cost Analysis</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#3a4357' }}>Estimated Size:</div>
                    <div>{analysis.detailed_analysis.estimated_size_m2} m²</div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#3a4357' }}>Material Costs:</div>
                    <div>{formatCurrency(analysis.detailed_analysis.material_costs?.total || 0)}</div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#3a4357' }}>Labor Costs:</div>
                    <div>{formatCurrency(analysis.detailed_analysis.labor_costs?.total || 0)}</div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600', color: '#3a4357' }}>Other Costs (Transport, Permits, Contingency):</div>
                    <div>{formatCurrency(analysis.detailed_analysis.other_costs?.total || 0)}</div>
                  </div>

                  <div style={{
                    borderTop: '2px solid #0c1220',
                    paddingTop: '15px',
                    marginTop: '15px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#0c1220', fontSize: '18px' }}>
                      Total Estimated Cost: {formatCurrency(analysis.detailed_analysis.total_cost)}
                    </div>
                    <div style={{ color: analysis.detailed_analysis.remaining_budget > 0 ? '#2d5a2d' : '#c33' }}>
                      Remaining Budget: {formatCurrency(analysis.detailed_analysis.remaining_budget)}
                    </div>
                    <div style={{ color: '#64708a' }}>
                      Budget Utilization: {Math.round(analysis.detailed_analysis.budget_utilization)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Low Budget Suggestions */}
              {!analysis.success && analysis.suggestions && (
                <div style={{
                  background: '#fff3cd',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  <h3 style={{ color: '#856404', marginBottom: '15px' }}>💡 Suggestions for Lower Budget</h3>
                  {analysis.suggestions.map((suggestion, index) => (
                    <div key={index} style={{
                      background: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div style={{ fontWeight: '600', color: '#856404' }}>{suggestion.title}</div>
                      <div style={{ color: '#666', fontSize: '14px' }}>{suggestion.description}</div>
                      <div style={{ color: '#856404', fontSize: '12px', marginTop: '4px' }}>
                        Estimated saving: {suggestion.estimated_saving}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: '#fee',
              padding: '20px',
              borderRadius: '12px'
            }}>
              <h3 style={{ color: '#c33', marginBottom: '10px' }}>❌ Analysis Failed</h3>
              <div>{analysis.message}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
