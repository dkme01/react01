import React, { Component } from 'react'; // importa o react e o componente da biblioteca
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa'; // importa icones que serão usados na página
import { Link } from 'react-router-dom'; // importa o router, que direciona as rotas acessadas

import api from '../../services/api'; // importa a api que será acessada

import Container from '../../components/Container'; // importa o componente
import { Form, SubmitButton, List } from './styles'; // importa a estilização por componente

export default class Main extends Component {
  /**
   * state (variáveis manipuláves, ou que necessitam de alteração pelo
   * componente) acessível pelo
   * componente, sempre que precisar armazenar informação, alterar propriedade
   * de um componente, etc, informar no aqui
   */
  state = {
    newRepo: '',
    repositories: [],
    loading: false,
    error: null,
  };

  // Carregar os dados do localStorage
  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    /**
     * busca os repositórios já armazenados no
     * localStorage e exibe assim que o componente é montado
     */

    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    } /** se existirem repositórios já armazenados, eles são carregados e formatados em JSON */
  }

  // Salvar os dados do localStorage
  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    /**
     * todas as vezes que o componente sofrer alteração,
     * elas serão salvas dentro do localStorage
     */

    if (prevState.repositories !== this.state.repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
    /**
     * se o state anterios for diferente do atual (alterado), a informação
     * é inserida no localStorage
     */
  }

  // toda vez que o Imput é alterado, a informação é armazenada no state da aplicação
  handleInputChange = e => {
    this.setState({ newRepo: e.target.value }); // pega o valor do input e armazena no state
  };

  // toda vez que um novo repositório é inserido, essa função busca e retorna as informações da api
  handleSubmit = async e => {
    e.preventDefault(); // não permite que a página recarregue quando um repositório for inserido

    this.setState({ loading: true, error: false }); // informações do state pertinentes a essa função
    try {
      const { newRepo, repositories } = this.state; // desestrutura o state da aplicação para acessar os item necessários

      if (newRepo === '') throw 'Você precisa indicar um repositório';
      /**
       * verifica se o state foi alterado (se existe
       * algo no input) antes de dar submit, caso esteja vazia, retorna um aviso
       */

      const hasRepo = repositories.find(r => r.name === newRepo);
      /**
       * busca nos repositórios o nome que foi inserido
       * caso exista, a variável 'hasRepo' recebe o nome do repositório
       */

      if (hasRepo) throw 'Repositorio duplicado';
      /**
       * Caso o repositório ja exista, retorna um aviso de erro
       */

      const response = await api.get(`/repos/${newRepo}`);
      /**
       * busca o repositório através da api com base no nome inserido
       * no input de texto
       */

      const data = {
        name: response.data.full_name,
      };
      /**
       * cria um arrai que armazena o nome do repositório
       */

      this.setState({
        repositories: [...repositories, data], // ordena o que já estava salvo com a nova entrada
        newRepo: '', // zera o valor do input de texto
      });
      /**
       * salva as informações do final do processo
       */
    } catch (error) {
      this.setState({ error: true }); // a propriedade 'erro' é alterada para true pois houve uma exceção
    } finally {
      this.setState({
        loading: false, // a pagina não está mais carregando os dados
      });
    }
  };

  render() {
    const { newRepo, loading, repositories, error } = this.state; // desestrutura o state da aplicação para acessar os item necessários

    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositórios
        </h1>

        <Form onSubmit={this.handleSubmit} error={error}>
          <input
            type="text"
            placeholder="Adicionar repositório"
            value={newRepo}
            onChange={this.handleInputChange}
          />

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#FFF" size={14} />
            ) : (
              <FaPlus color="#FFF" size={14} />
            )}
          </SubmitButton>
        </Form>

        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
        {/* sempre que fizer uma listagem, o primeiro item deve ter a propriedade 'key' */}
      </Container>
    );
  }
}
