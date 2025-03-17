import axios from 'axios'
import chalk from 'chalk'
import ora from 'ora'
import inquirer from 'inquirer'

interface GitHubEvent {
  type: string
  repo: { name: string }
}

const fetchGitHubActivity = async (
  username: string
): Promise<GitHubEvent[]> => {
  try {
    const response = await axios.get(
      `https://api.github.com/users/${username}/events`,
      {
        headers: { 'User-Agent': 'node.js' },
      }
    )
    return response.data
  } catch (error) {
    throw new Error(
      'Error when searching for user activity. Check the username or your internet connection'
    )
  }
}

const displayActivity = (activities: GitHubEvent[], username: string): void => {
  if (activities.length === 0) {
    console.log(chalk.yellow('No recent activity found for this user'))
    return
  }

  console.log(chalk.green(`\n Recent activity of ${username}`))
  activities.slice(0, 5).forEach((event, index) => {
    console.log(
      `${chalk.blue(index + 1)}. ${chalk.cyan(event.type)} - ${chalk.magenta(
        event.repo.name
      )}`
    )
  })
}

const askForUsername = async (): Promise<string> => {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Enter your GitHub username',
      validate: (input) => (input ? true : 'The username must not be empty'),
    },
  ])
  return answers.username
}

const main = async (): Promise<void> => {
  try {
    const username = await askForUsername()
    const spinner = ora('Searching for user activity on GitHub...').start()

    const activities = await fetchGitHubActivity(username)
    spinner.succeed('Load activity completed!')

    displayActivity(activities, username)
  } catch (error) {
    if (error instanceof Error) {
      console.log(chalk.red(`Erro: ${error.message}`))
    } else {
      console.log(chalk.red('An unknown error occured'))
    }
  }
}

main()
