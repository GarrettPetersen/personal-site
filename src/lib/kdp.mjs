import { parseDate } from './dates.mjs';
import { formatMoney } from './revenue.mjs';

/** Validate the selected public aggregates, not the private source workbook. @param {any} report */
export function validateKdpReport(report) {
  const require=(ok,message)=>{if(!ok)throw new Error(`KDP report: ${message}`);};
  const units=value=>Number.isSafeInteger(value)&&value>=0;
  require(report?.schemaVersion===1&&report.basis==='estimated','invalid report version or basis');
  parseDate(report.periodStart);parseDate(report.periodEnd);
  require(report.periodStart<=report.periodEnd&&Number.isFinite(Date.parse(report.importedAt)),'invalid source dates');
  require(Array.isArray(report.months)&&report.months.length>0&&Array.isArray(report.titles)&&report.titles.length>0&&Array.isArray(report.currencyTotals),'missing source aggregates');
  const seenMonths=new Set(),seenTitles=new Set();let previous='';
  for(const month of report.months){
    parseDate(`${month.month}-01`);
    require(!seenMonths.has(month.month)&&month.month>previous&&units(month.units)&&typeof month.partial==='boolean','invalid monthly units');
    require(month.month>=report.periodStart.slice(0,7)&&month.month<=report.periodEnd.slice(0,7),'month outside report window');
    seenMonths.add(month.month);previous=month.month;
  }
  const currencyTotals=new Map();
  for(const title of report.titles){
    require(typeof title.id==='string'&&!seenTitles.has(title.id)&&typeof title.label==='string'&&title.label.length>0&&units(title.units)&&units(title.recentMonthlyUsdCents),'invalid title aggregate');
    seenTitles.add(title.id);
    require(title.royalties&&Object.keys(title.royalties).length>0,'missing title royalties');
    for(const [currency,amount] of Object.entries(title.royalties)){
      formatMoney(/** @type {number} */(amount),currency);
      currencyTotals.set(currency,(currencyTotals.get(currency)??0)+amount);
    }
  }
  require(units(report.totalUnits)&&report.months.reduce((sum,m)=>sum+m.units,0)===report.totalUnits&&report.titles.reduce((sum,t)=>sum+t.units,0)===report.totalUnits,'unit totals disagree');
  const seenCurrencies=new Set();
  for(const total of report.currencyTotals){
    formatMoney(total.amountCents,total.currency);
    require(!seenCurrencies.has(total.currency)&&currencyTotals.get(total.currency)===total.amountCents,'currency totals disagree');
    seenCurrencies.add(total.currency);
  }
  require([...currencyTotals].every(([currency,amount])=>amount===0||seenCurrencies.has(currency)),'missing currency total');
  const benchmark=report.benchmark;
  require(benchmark&&benchmark.currency==='USD'&&Number.isSafeInteger(benchmark.months)&&benchmark.months>0,'invalid benchmark window');
  parseDate(benchmark.periodStart);parseDate(benchmark.periodEnd);
  require(benchmark.periodStart>=report.periodStart&&benchmark.periodEnd<=report.periodEnd&&benchmark.periodStart<=benchmark.periodEnd,'benchmark outside source window');
  require(benchmark.minMonthlyCents===Math.min(...report.titles.map(t=>t.recentMonthlyUsdCents))&&benchmark.maxMonthlyCents===Math.max(...report.titles.map(t=>t.recentMonthlyUsdCents)),'benchmark and title values disagree');
  const catalogue=report.catalogue;
  require(catalogue&&units(catalogue.liveWorks)&&Number.isSafeInteger(catalogue.totalWorks)&&catalogue.totalWorks>0&&catalogue.liveWorks<=catalogue.totalWorks&&Number.isFinite(Date.parse(catalogue.checkedAt)),'invalid published catalogue count');
  return report;
}
