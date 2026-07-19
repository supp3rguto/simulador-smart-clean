import { useState } from 'react';
import './App.css';

function App() {
  const [inputs, setInputs] = useState({
    tch: 79, area: 39580, diasSafra: 220, atr: 137, 
    perdasPadrao: 9, vegetalPadrao: 6, mixEtanol: 43, precoEtanol: 2.2,
    precoSmartClean: 152678, redPerdas: -3, acrescVegetal: 1.5, redDiesel: 5.3,
    consumoDiesel: 35.7, precoDiesel: 5.3, manutencaoAno: 389766, 
    operadoresMaq: 3.6, salarioOperador: 7956, taxaJuros: 12.5, 
    prazoFinanciamento: 5, valorColhedora: 2478967
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value) 
    }));
  };

  const formatNum = (n) => (n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const formatDinheiro = (n) => (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const colorir = (valor, invertido = false) => {
    const ehPositivo = invertido ? valor <= 0 : valor >= 0;
    return { color: ehPositivo ? '#2e7d32' : '#d32f2f' };
  };

  const calcularPMT = (taxa, prazo, valorPresente) => {
    if (taxa === 0) return valorPresente / prazo;
    const pvif = Math.pow(1 + taxa, prazo);
    return (taxa * valorPresente * pvif) / (pvif - 1);
  };

  const calc = { ...inputs };
  calc.perdasPadrao = (calc.perdasPadrao || 0) / 100;
  calc.vegetalPadrao = (calc.vegetalPadrao || 0) / 100;
  calc.redPerdas = (calc.redPerdas || 0) / 100;
  calc.acrescVegetal = (calc.acrescVegetal || 0) / 100;
  calc.redDiesel = (calc.redDiesel || 0) / 100;
  calc.taxaJuros = (calc.taxaJuros || 0) / 100;
  calc.mixEtanol = (calc.mixEtanol || 0) / 100;

  const fatorEtanol = 1.6761;
  const horasProdutivasSafra = 2679;
  const rendimentoTonHoraPadrao = 49.66;
  const rendimentoTonHoraSC = 50.48;

  const perdaTonPadrao = calc.tch * calc.perdasPadrao;
  const tchComPerdasPadrao = calc.tch - perdaTonPadrao;
  const vegetalTonPadrao = tchComPerdasPadrao * calc.vegetalPadrao;
  const tchLiquidoPadrao = tchComPerdasPadrao - vegetalTonPadrao;
  const volumePadrao = calc.area * tchLiquidoPadrao;

  const perdasSC = calc.perdasPadrao + calc.redPerdas;
  const perdaTonSC = calc.tch * perdasSC;
  const tchComPerdasSC = calc.tch - perdaTonSC;
  const vegetalSC = calc.vegetalPadrao + calc.acrescVegetal;
  const vegetalTonSC = tchComPerdasSC * vegetalSC;
  const tchLiquidoSC = tchComPerdasSC - vegetalTonSC;
  const volumeSC = calc.area * tchLiquidoSC;
  const volDif = volumeSC - volumePadrao;

  const volEtanolPadrao = (volumePadrao * calc.atr * calc.mixEtanol) / fatorEtanol;
  const receitaPadrao = volEtanolPadrao * calc.precoEtanol;
  const volEtanolSC = (volumeSC * calc.atr * calc.mixEtanol) / fatorEtanol;
  const receitaSC = volEtanolSC * calc.precoEtanol;
  const recDif = receitaSC - receitaPadrao;

  const consumoLitrosHoraPadrao = calc.consumoDiesel;
  const consumoLitrosHoraSC = consumoLitrosHoraPadrao * (1 + calc.redDiesel);

  const custoCombPadrao = (consumoLitrosHoraPadrao / rendimentoTonHoraPadrao) * calc.precoDiesel;
  const custoCombSC = (consumoLitrosHoraSC / rendimentoTonHoraSC) * calc.precoDiesel;

  const custoManutPadrao = 3.63 * (calc.manutencaoAno / 389766);
  const custoManutSC = 3.63 * (calc.manutencaoAno / 389766);

  const custoOpPadrao = 1.93 * (calc.salarioOperador / 7956) * (calc.operadoresMaq / 3.6);
  const custoOpSC = 1.93 * (calc.salarioOperador / 7956) * (calc.operadoresMaq / 3.6);

  const valorResidualPadrao = calc.valorColhedora * 0.15;
  const parcelaPadrao = calcularPMT(calc.taxaJuros, calc.prazoFinanciamento, calc.valorColhedora);
  const jurosAnoPadrao = ((parcelaPadrao * calc.prazoFinanciamento) - calc.valorColhedora) / calc.prazoFinanciamento;
  const depAnoPadrao = (calc.valorColhedora - valorResidualPadrao) / 6.34;
  const custoDepPadrao = (depAnoPadrao + jurosAnoPadrao) / (rendimentoTonHoraPadrao * horasProdutivasSafra);

  const valorColhedoraSC = calc.valorColhedora + calc.precoSmartClean;
  const valorResidualSC = valorColhedoraSC * 0.15;
  const parcelaSC = calcularPMT(calc.taxaJuros, calc.prazoFinanciamento, valorColhedoraSC);
  const jurosAnoSC = ((parcelaSC * calc.prazoFinanciamento) - valorColhedoraSC) / calc.prazoFinanciamento;
  const depAnoSC = (valorColhedoraSC - valorResidualSC) / 6.45;
  const custoDepSC = (depAnoSC + jurosAnoSC) / (rendimentoTonHoraSC * horasProdutivasSafra);

  const custoTotalPadrao_Rt = custoCombPadrao + custoManutPadrao + custoOpPadrao + custoDepPadrao;
  const custoTotalSC_Rt = custoCombSC + custoManutSC + custoOpSC + custoDepSC;
  
  const custoGlobalPadrao = custoTotalPadrao_Rt * volumePadrao;
  const custoGlobalSC = custoTotalSC_Rt * volumeSC;
  const variacaoCustoGlobal = custoGlobalSC - custoGlobalPadrao;
  const diferencaCustos = custoTotalSC_Rt - custoTotalPadrao_Rt;

  const retornoTotal = recDif - variacaoCustoGlobal - calc.precoSmartClean;

  return (
    <div className="container">
      <header>
        <h1>Simulador de Viabilidade - Smart Clean</h1>
        <p>Análise completa de ganhos de volume, receita e redução de custos operacionais</p>
      </header>

      <main>
        <section className="inputs-section">
          
          <fieldset>
            <legend>Parâmetros Agrícolas</legend>
            <div className="input-grid">
              <div className="input-group">
                <label>TCH no campo (t/ha)</label>
                <input type="number" name="tch" value={inputs.tch} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Área a ser colhida (ha)</label>
                <input type="number" name="area" value={inputs.area} onChange={handleChange} />
              </div>
              
              <div className="input-group">
                <label>Perdas Padrão (%)</label>
                <input type="number" name="perdasPadrao" value={inputs.perdasPadrao} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Perdas c/ SC (%) 🔒</label>
                <input type="text" disabled value={formatNum((calc.perdasPadrao + calc.redPerdas) * 100)} />
              </div>

              <div className="input-group">
                <label>Vegetal Padrão (%)</label>
                <input type="number" name="vegetalPadrao" value={inputs.vegetalPadrao} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Vegetal c/ SC (%) 🔒</label>
                <input type="text" disabled value={formatNum((calc.vegetalPadrao + calc.acrescVegetal) * 100)} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Parâmetros Industriais</legend>
            <div className="input-grid">
              <div className="input-group">
                <label>ATR (kg/t)</label>
                <input type="number" name="atr" value={inputs.atr} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Dias de safra (n)</label>
                <input type="number" name="diasSafra" value={inputs.diasSafra} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Mix de Etanol (%)</label>
                <input type="number" name="mixEtanol" value={inputs.mixEtanol} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Preço do Etanol (R$/L)</label>
                <input type="number" name="precoEtanol" value={inputs.precoEtanol} onChange={handleChange} step="0.1" />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Tecnologia Smart Clean</legend>
            <div className="input-grid">
              <div className="input-group" style={{gridColumn: '1 / -1'}}>
                <label>Investimento na Tecnologia (R$)</label>
                <input type="number" name="precoSmartClean" value={inputs.precoSmartClean} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Redução de perdas (% p.p.)</label>
                <input type="number" name="redPerdas" value={inputs.redPerdas} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Acréscimo vegetal (% p.p.)</label>
                <input type="number" name="acrescVegetal" value={inputs.acrescVegetal} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Aumento de diesel (%)</label>
                <input type="number" name="redDiesel" value={inputs.redDiesel} onChange={handleChange} />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Colhedora e Custos Operacionais</legend>
            <div className="input-grid">
              <div className="input-group">
                <label>Consumo Diesel (L/h)</label>
                <input type="number" name="consumoDiesel" value={inputs.consumoDiesel} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label>Consumo c/ SC (L/h) 🔒</label>
                <input type="text" disabled value={formatNum(consumoLitrosHoraSC)} />
              </div>

              <div className="input-group">
                <label>Preço do Diesel (R$/L)</label>
                <input type="number" name="precoDiesel" value={inputs.precoDiesel} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label>Manutenção (R$/ano)</label>
                <input type="number" name="manutencaoAno" value={inputs.manutencaoAno} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Operadores por Máquina</label>
                <input type="number" name="operadoresMaq" value={inputs.operadoresMaq} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label>Salário Operador (R$/mês)</label>
                <input type="number" name="salarioOperador" value={inputs.salarioOperador} onChange={handleChange} />
              </div>

              <div className="input-group" style={{gridColumn: '1 / -1'}}>
                <label>Valor da Colhedora (R$)</label>
                <input type="number" name="valorColhedora" value={inputs.valorColhedora} onChange={handleChange} />
              </div>
              <div className="input-group" style={{gridColumn: '1 / -1'}}>
                <label>Valor da Colhedora c/ SC (R$) 🔒</label>
                <input type="text" disabled value={formatDinheiro(valorColhedoraSC)} />
              </div>

              <div className="input-group">
                <label>Taxa de Juros (% ano)</label>
                <input type="number" name="taxaJuros" value={inputs.taxaJuros} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label>Prazo Financiamento (anos)</label>
                <input type="number" name="prazoFinanciamento" value={inputs.prazoFinanciamento} onChange={handleChange} />
              </div>
            </div>
          </fieldset>
        </section>

        <section className="results-section">
          <h2>Resultados Comparativos</h2>
          
          <div className="tabelas-container">
            <div className="table-wrapper">
              <h3>1. Produção e Receitas</h3>
              <table>
                <thead>
                  <tr>
                    <th>Indicador</th>
                    <th>Cenário Padrão</th>
                    <th>C/ Smart Clean</th>
                    <th>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Volume Cana Líquido (t)</td>
                    <td>{formatNum(volumePadrao)}</td>
                    <td>{formatNum(volumeSC)}</td>
                    <td className="highlight" style={colorir(volDif)}>{volDif > 0 ? '+' : ''}{formatNum(volDif)}</td>
                  </tr>
                  <tr>
                    <td>Receita Bruta (R$)</td>
                    <td>{formatDinheiro(receitaPadrao)}</td>
                    <td>{formatDinheiro(receitaSC)}</td>
                    <td className="highlight" style={colorir(recDif)}>{recDif > 0 ? '+' : ''}{formatDinheiro(recDif)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="table-wrapper">
              <h3>2. Custos de Colheita (R$/t)</h3>
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Padrão</th>
                    <th>Smart Clean</th>
                    <th>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Combustível</td>
                    <td>{formatNum(custoCombPadrao)}</td>
                    <td>{formatNum(custoCombSC)}</td>
                    <td>{formatNum(custoCombSC - custoCombPadrao)}</td>
                  </tr>
                  <tr>
                    <td>Manutenção</td>
                    <td>{formatNum(custoManutPadrao)}</td>
                    <td>{formatNum(custoManutSC)}</td>
                    <td>{formatNum(custoManutSC - custoManutPadrao)}</td>
                  </tr>
                  <tr>
                    <td>Operador</td>
                    <td>{formatNum(custoOpPadrao)}</td>
                    <td>{formatNum(custoOpSC)}</td>
                    <td>{formatNum(custoOpSC - custoOpPadrao)}</td>
                  </tr>
                  <tr>
                    <td>Depreciação + Juros</td>
                    <td>{formatNum(custoDepPadrao)}</td>
                    <td>{formatNum(custoDepSC)}</td>
                    <td>{formatNum(custoDepSC - custoDepPadrao)}</td>
                  </tr>
                  <tr className="total-row">
                    <td>Custo Total</td>
                    <td>{formatNum(custoTotalPadrao_Rt)}</td>
                    <td>{formatNum(custoTotalSC_Rt)}</td>
                    <td className="highlight" style={colorir(diferencaCustos, true)}>{formatNum(diferencaCustos)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="resumo-financeiro">
              <h3>3. Viabilidade Final do Projeto</h3>
              <div className="cards-resumo">
                <div className="card">
                  <span>Investimento SC</span>
                  <strong>{formatDinheiro(calc.precoSmartClean)}</strong>
                </div>
                <div className="card">
                  <span>Ganhos c/ Receita</span>
                  <strong style={colorir(recDif)}>{formatDinheiro(recDif)}</strong>
                </div>
                <div className="card">
                  <span>Variação Custos</span>
                  <strong style={colorir(-variacaoCustoGlobal)}>{formatDinheiro(-variacaoCustoGlobal)}</strong>
                </div>
                <div className="card destaque">
                  <span>Retorno Total Estimado</span>
                  <strong>{formatDinheiro(retornoTotal)}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>Desenvolvido por <a href="https://www.linkedin.com/in/oaugustobarbosa/" target="_blank" rel="noreferrer">Augusto Barbosa</a> | 2026</p>
      </footer>
    </div>
  );
}

export default App;