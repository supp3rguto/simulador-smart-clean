import { useState } from 'react';
import './App.css';

function App() {
  const [inputs, setInputs] = useState({
    tch: 79,
    area: 39580,
    diasSafra: 220,
    perdasPadrao: 9,
    vegetalPadrao: 6,
    atr: 137,
    precoEtanol: 2.2,
    precoSmartClean: 152678,
    redPerdas: -3,
    acrescVegetal: 1.5,
    redDiesel: 5.3,
    precoDiesel: 5.3,
    salarioOperador: 7956,
    taxaJuros: 12.5,
    prazoFinanciamento: 5,
    valorColhedora: 2478967
  });

  // Função para atualizar os valores quando o usuário digita
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value) // Permite apagar sem dar erro
    }));
  };

  // 2. FUNÇÕES DE CÁLCULO E FORMATAÇÃO
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

  // 3. EXECUÇÃO DOS CÁLCULOS EM TEMPO REAL
  const calc = { ...inputs };
  // Conversão de % para decimal
  calc.perdasPadrao = (calc.perdasPadrao || 0) / 100;
  calc.vegetalPadrao = (calc.vegetalPadrao || 0) / 100;
  calc.redPerdas = (calc.redPerdas || 0) / 100;
  calc.acrescVegetal = (calc.acrescVegetal || 0) / 100;
  calc.redDiesel = (calc.redDiesel || 0) / 100;
  calc.taxaJuros = (calc.taxaJuros || 0) / 100;

  const fatorEtanol = 1.6761;
  const mixEtanol = 0.43;
  const horasProdutivasSafra = 2679;

  // Bloco 1: Volume
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

  // Bloco 2: Receita
  const volEtanolPadrao = (volumePadrao * calc.atr * mixEtanol) / fatorEtanol;
  const receitaPadrao = volEtanolPadrao * calc.precoEtanol;
  const volEtanolSC = (volumeSC * calc.atr * mixEtanol) / fatorEtanol;
  const receitaSC = volEtanolSC * calc.precoEtanol;
  const recDif = receitaSC - receitaPadrao;

  // Bloco 3: Custos
  const consumoLitrosHoraPadrao = 35.7;
  const consumoLitrosHoraSC = consumoLitrosHoraPadrao * (1 + calc.redDiesel);
  const rendimentoTonHoraPadrao = 49.66;
  const rendimentoTonHoraSC = 50.48;

  const custoCombPadrao = (consumoLitrosHoraPadrao / rendimentoTonHoraPadrao) * calc.precoDiesel;
  const custoCombSC = (consumoLitrosHoraSC / rendimentoTonHoraSC) * calc.precoDiesel;

  const custoManutPadrao = 3.63;
  const custoManutSC = 3.63;
  const custoOpPadrao = 1.93;
  const custoOpSC = 1.93;

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

  // Bloco 4: Retorno
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
            <legend>Parâmetros Agrícolas e de Safra</legend>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="tch">TCH no campo (t/ha)</label>
                <input type="number" name="tch" value={inputs.tch} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="area">Área a ser colhida (ha)</label>
                <input type="number" name="area" value={inputs.area} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="diasSafra">Dias de safra (n)</label>
                <input type="number" name="diasSafra" value={inputs.diasSafra} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="perdasPadrao">Perdas Padrão (%)</label>
                <input type="number" name="perdasPadrao" value={inputs.perdasPadrao} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="vegetalPadrao">Vegetal Padrão (%)</label>
                <input type="number" name="vegetalPadrao" value={inputs.vegetalPadrao} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="atr">ATR (kg/t)</label>
                <input type="number" name="atr" value={inputs.atr} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="precoEtanol">Preço do Etanol (R$/L)</label>
                <input type="number" name="precoEtanol" value={inputs.precoEtanol} onChange={handleChange} step="0.1" />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Parâmetros da Tecnologia Smart Clean</legend>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="precoSmartClean">Investimento na Tecnologia (R$)</label>
                <input type="number" name="precoSmartClean" value={inputs.precoSmartClean} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="redPerdas">Redução de perdas (% p.p.)</label>
                <input type="number" name="redPerdas" value={inputs.redPerdas} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="acrescVegetal">Acréscimo de vegetal (% p.p.)</label>
                <input type="number" name="acrescVegetal" value={inputs.acrescVegetal} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="redDiesel">Redução de diesel (%)</label>
                <input type="number" name="redDiesel" value={inputs.redDiesel} onChange={handleChange} step="0.1" />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Custos Operacionais e Equipamentos</legend>
            <div className="input-grid">
              <div className="input-group">
                <label htmlFor="precoDiesel">Preço do diesel (R$/L)</label>
                <input type="number" name="precoDiesel" value={inputs.precoDiesel} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="salarioOperador">Salário do Operador (R$/mês)</label>
                <input type="number" name="salarioOperador" value={inputs.salarioOperador} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="taxaJuros">Taxa de juros (% ano)</label>
                <input type="number" name="taxaJuros" value={inputs.taxaJuros} onChange={handleChange} step="0.1" />
              </div>
              <div className="input-group">
                <label htmlFor="prazoFinanciamento">Prazo do financiamento (anos)</label>
                <input type="number" name="prazoFinanciamento" value={inputs.prazoFinanciamento} onChange={handleChange} />
              </div>
              <div className="input-group">
                <label htmlFor="valorColhedora">Valor da Colhedora (R$)</label>
                <input type="number" name="valorColhedora" value={inputs.valorColhedora} onChange={handleChange} />
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
                    <td>Volume de Cana Líquido (t)</td>
                    <td>{formatNum(volumePadrao)}</td>
                    <td>{formatNum(volumeSC)}</td>
                    <td className="highlight" style={colorir(volDif)}>{volDif > 0 ? '+' : ''}{formatNum(volDif)}</td>
                  </tr>
                  <tr>
                    <td>Receita Bruta Projetada (R$)</td>
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
                    <th>Cenário Padrão</th>
                    <th>C/ Smart Clean</th>
                    <th>Variação</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Combustível (R$/t)</td>
                    <td>{formatNum(custoCombPadrao)}</td>
                    <td>{formatNum(custoCombSC)}</td>
                    <td>{formatNum(custoCombSC - custoCombPadrao)}</td>
                  </tr>
                  <tr>
                    <td>Manutenção (R$/t)</td>
                    <td>{formatNum(custoManutPadrao)}</td>
                    <td>{formatNum(custoManutSC)}</td>
                    <td>{formatNum(custoManutSC - custoManutPadrao)}</td>
                  </tr>
                  <tr>
                    <td>Operador (R$/t)</td>
                    <td>{formatNum(custoOpPadrao)}</td>
                    <td>{formatNum(custoOpSC)}</td>
                    <td>{formatNum(custoOpSC - custoOpPadrao)}</td>
                  </tr>
                  <tr>
                    <td>Depreciação + Juros (R$/t)</td>
                    <td>{formatNum(custoDepPadrao)}</td>
                    <td>{formatNum(custoDepSC)}</td>
                    <td>{formatNum(custoDepSC - custoDepPadrao)}</td>
                  </tr>
                  <tr className="total-row">
                    <td>Custo Total (R$/t)</td>
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
                  <span>Investimento Smart Clean</span>
                  <strong>{formatDinheiro(calc.precoSmartClean)}</strong>
                </div>
                <div className="card">
                  <span>Ganhos c/ Tecnologia</span>
                  <strong style={colorir(recDif)}>{formatDinheiro(recDif)}</strong>
                </div>
                <div className="card">
                  <span>Variação Custos Operacionais</span>
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
        <p>
          Desenvolvido por <a href="https://www.linkedin.com/oaugustobarbosa" target="_blank" rel="noreferrer">Augusto Barbosa | 2026</a>
        </p>
      </footer>
    </div>
  );
}

export default App;