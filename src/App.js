import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';
function App() {
  const [periods, setPeriods] = useState([
    { period: 'period1', demand: 1200, regularCapacity: 2000, overtimeCapacity: 0, subcontractCapacity: 0 }
  ]);
  const [costs, setCosts] = useState({
    regularTime: 8,
    overtime: 12,
    subcontracting: 17,
    backorderCost: 4,
    increaseCost: 5,
    decreaseCost: 6,
  });

  const [results, setResults] = useState([]);

  const addPeriod = () => {
    setPeriods([...periods, { 
      period: `period${periods.length + 1}`, 
      demand: 0, 
      regularCapacity: 0, 
      overtimeCapacity: 0, 
      subcontractCapacity: 0 
    }]);
  };

  const updatePeriod = (index, field, value) => {
    const newPeriods = [...periods];
    newPeriods[index][field] = parseFloat(value);
    setPeriods(newPeriods);
  };

  const updateCost = (field, value) => {
    setCosts({ ...costs, [field]: parseFloat(value) });
  };

  useEffect(() => {
    calculateResults();
  }, [periods, costs]);

  const calculateResults = () => {
    let newResults = [];
    let totalDemand = 0;
    let totalRegularCapacity = 0;
    let totalOvertimeCapacity = 0;
    let totalSubcontractCapacity = 0;
    let totalRegularProduction = 0;
    let totalOvertimeProduction = 0;
    let totalSubcontracting = 0;
    let totalUnitIncrease = 0;
    let totalUnitDecrease = 0;
    let lastPeriodUnits = 0; // Start from 0 for the first period

    periods.forEach((period) => {
      const regularProduction = Math.min(period.demand, period.regularCapacity);
      const overtimeProduction = Math.min(period.demand - regularProduction, period.overtimeCapacity);
      const subcontracting = Math.min(period.demand - regularProduction - overtimeProduction, period.subcontractCapacity);
      const unitIncrease = Math.max(0, regularProduction - lastPeriodUnits);
      const unitDecrease = Math.max(0, lastPeriodUnits - regularProduction);

      totalDemand += period.demand;
      totalRegularCapacity += period.regularCapacity;
      totalOvertimeCapacity += period.overtimeCapacity;
      totalSubcontractCapacity += period.subcontractCapacity;
      totalRegularProduction += regularProduction;
      totalOvertimeProduction += overtimeProduction;
      totalSubcontracting += subcontracting;
      totalUnitIncrease += unitIncrease;
      totalUnitDecrease += unitDecrease;

      newResults.push({
        ...period,
        regularProduction,
        overtimeProduction,
        subcontracting,
        unitIncrease,
        unitDecrease
      });

      lastPeriodUnits = regularProduction; // Update for the next period
    });

    const subtotalCosts = {
      regularTime: totalRegularProduction * costs.regularTime,
      overtime: totalOvertimeProduction * costs.overtime,
      subcontracting: totalSubcontracting * costs.subcontracting,
      unitIncrease: totalUnitIncrease * costs.increaseCost,
      unitDecrease: totalUnitDecrease * costs.decreaseCost
    };

    const totalCost = Object.values(subtotalCosts).reduce((a, b) => a + b, 0);

    setResults([
      ...newResults,
      {
        period: 'Total',
        demand: totalDemand,
        regularCapacity: totalRegularCapacity,
        overtimeCapacity: totalOvertimeCapacity,
        subcontractCapacity: totalSubcontractCapacity,
        regularProduction: totalRegularProduction,
        overtimeProduction: totalOvertimeProduction,
        subcontracting: totalSubcontracting,
        unitIncrease: totalUnitIncrease,
        unitDecrease: totalUnitDecrease
      },
      {
        period: 'Subtotal Costs',
        regularProduction: subtotalCosts.regularTime,
        overtimeProduction: subtotalCosts.overtime,
        subcontracting: subtotalCosts.subcontracting,
        unitIncrease: subtotalCosts.unitIncrease,
        unitDecrease: subtotalCosts.unitDecrease
      },
      {
        period: 'Total Cost',
        demand: totalCost
      }
    ]);
  };

  return (
    <div className="font-sans p-5">
      <h2 className="text-2xl font-bold mb-4">Chase Current Demand Calculator</h2>
      
      <div className="flex md:flex-row flex-col-reverse justify-between">
        <div className="md:w-2/3 w-full">
          <h3 className="text-xl font-semibold mb-2">Input Data</h3>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Period</th>
                <th className="border border-gray-300 p-2">Demand</th>
                <th className="border border-gray-300 p-2">Regular Capacity</th>
                <th className="border border-gray-300 p-2">Overtime Capacity</th>
                <th className="border border-gray-300 p-2">Subcontract Capacity</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period, index) => (
                <tr key={period.period} >
                  <td className="border border-gray-300 p-2">{period.period}</td>
                  <td className="border border-gray-300 p-2">
                    <input type="number" value={period.demand} onChange={(e) => updatePeriod(index, 'demand', e.target.value)} className="border border-gray-300 p-1 w-full" />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input type="number" value={period.regularCapacity} onChange={(e) => updatePeriod(index, 'regularCapacity', e.target.value)} className="border border-gray-300 p-1 w-full" />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input type="number" value={period.overtimeCapacity} onChange={(e) => updatePeriod(index, 'overtimeCapacity', e.target.value)} className="border border-gray-300 p-1 w-full" />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <input type="number" value={period.subcontractCapacity} onChange={(e) => updatePeriod(index, 'subcontractCapacity', e.target.value)} className="border border-gray-300 p-1 w-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addPeriod} className="mt-3 bg-blue-500 text-white px-4 py-2 rounded">Add Period</button>
        </div>
        
        <div className="md:w-1/3 w-full ml-5">
          <h3 className="text-xl font-semibold mb-2">Unit Costs</h3>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Cost Type</th>
                <th className="border border-gray-300 p-2">Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(costs).map(([key, value]) => (
                <tr key={key}>
                  <td className="border border-gray-300 p-2">{key}</td>
                  <td className="border border-gray-300 p-2">
                    <input type="number" value={value} onChange={(e) => updateCost(key, e.target.value)} className="border border-gray-300 p-1 w-full" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 className="text-xl font-semibold mt-5 mb-2">Results</h3>
      <table className="min-w-full border-collapse border border-gray-300">
        <thead className='bg-gray-200'>
          <tr>
            <th className="border border-gray-300 p-2">Period</th>
            <th className="border border-gray-300 p-2">Demand</th>
            <th className="border border-gray-300 p-2">Regular Capacity</th>
            <th className="border border-gray-300 p-2">Overtime Capacity</th>
            <th className="border border-gray-300 p-2">Subcontract Capacity</th>
            <th className="border border-gray-300 p-2">Regular Production</th>
            <th className="border border-gray-300 p-2">Overtime Production</th>
            <th className="border border-gray-300 p-2">Subcontracting</th>
            <th className="border border-gray-300 p-2">Units Increase</th>
            <th className="border border-gray-300 p-2">Units Decrease</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : ' bg-gray-100'}`}>
              <td className="border border-gray-300 p-2">{result.period}</td>
              <td className="border border-gray-300 p-2">{result.demand}</td>
              <td className="border border-gray-300 p-2">{result.regularCapacity}</td>
              <td className="border border-gray-300 p-2">{result.overtimeCapacity}</td>
              <td className="border border-gray-300 p-2">{result.subcontractCapacity}</td>
              <td className="border border-gray-300 p-2">{result.regularProduction}</td>
              <td className="border border-gray-300 p-2">{result.overtimeProduction}</td>
              <td className="border border-gray-300 p-2">{result.subcontracting}</td>
              <td className="border border-gray-300 p-2">{result.unitIncrease}</td>
              <td className="border border-gray-300 p-2">{result.unitDecrease}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
