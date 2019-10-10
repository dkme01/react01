import React, { Component } from 'react'; // importa o react e o componente da biblioteca
import { Link } from 'react-router-dom'; // importa o router, que direciona as rotas acessadas
import PropTypes from 'prop-types'; // importa o propTypes, que cuida de validar algumas propriedades dos componentes
import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssueList, IssueFilter, PageActions } from './styles';

export default class Repository extends Component {
  /**
   * valida as propriedades da api que necessitam dessa segurança
   */
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  /**
   * state (variáveis manipuláves, ou que necessitam de alteração pelo
   * componente) acessível pelo
   * componente, sempre que precisar armazenar informação, alterar propriedade
   * de um componente, etc, informar no aqui
   */
  state = {
    repository: {},
    issues: [],
    loading: true,
    filters: [
      { state: 'all', label: 'Todas', active: true },
      { state: 'open', label: 'Abertas', active: false },
      { state: 'closed', label: 'Fechadas', active: false },
    ],
    filterIndex: 0,
    page: 1,
  };

  async componentDidMount() {
    // desestrutura a propriedade validada acima
    const { match } = this.props;
    // desestrutura os itens do state que serão usados por esse componente
    const { filters } = this.state;

    // pega o nome do repositório e insere em uma string
    const repoName = decodeURIComponent(match.params.repository);

    /**
     * promise que busca o repositório, e também as issues na
     * pagina do repositório e lista elas por estado
     */
    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters.find(f => f.active).state,
          per_page: 5,
        },
      }),
    ]);

    // state recebe as informações carregadas pela função e reseta alguns itens
    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    // desestrutura a propriedade validada acima
    const { match } = this.props;
    // desestrutura os itens do state que serão usados por esse componente
    const { filters, filterIndex, page } = this.state;
    // pega o nome do repositório e insere em uma string
    const repoName = decodeURIComponent(match.params.repository);

    /**
     * promise que busca o repositório, e também as issues na
     * pagina do repositório e lista elas por estado
     */
    const response = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[filterIndex].state,
        per_page: 5,
        page,
      },
    });

    // state recebe as informações carregadas pela função e reseta alguns itens
    this.setState({ issues: response.data });
  };

  handleFilterClick = async filterIndex => {
    await this.setState({ filterIndex });

    this.loadIssues();
  };

  handlePage = async action => {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });
    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      filterIndex,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <IssueFilter active={filterIndex}>
            {filters.map((filter, index) => (
              <button
                type="button"
                key={filter.label}
                onClick={() => this.handleFilterClick(index)}
              >
                {filter.label}
              </button>
            ))}
          </IssueFilter>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <PageActions>
          <button
            type="button"
            disabled={page < 2}
            onClick={() => this.handlePage('next')}
          >
            Próximo
          </button>
        </PageActions>
      </Container>
    );
  }
}
