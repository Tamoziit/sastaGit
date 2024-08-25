class GitClient { //handles git client commands
    run(command) { //executing a cmd provided by git client using git cli
        command.execute(); //execute func. -> common for all cmds, that carries out the task of that cmd
    }
}

module.exports = GitClient;