const core = require('@actions/core')
const { exec } = require('@actions/exec')
const fs = require('fs')

const getVersion = () => {
  const file = fs.readFileSync('package.json')
  const { version } = JSON.parse(file.toString())
  return version
}

const createTag = async (version, prefix = '') => {
  const tag = `${prefix}${version}`
  try {
    await exec('git tag', ['-a', `${tag}`, '-m', `'Release version ${tag}'`])
    return tag
  } catch (e) {
    return
  }
}

const pushTag = async () => {
  const actor = process.env.GITHUB_ACTOR
  const repository = process.env.GITHUB_REPOSITORY
  const repository = process.env.GITHUB_REPOSITORY
  const token = core.getInput('token')
  const remote = `https://${actor}:${token}@github.com/${repository}.git`
  await exec(`git push "${remote}" --tags`)
  return true
}

const run = async () => {
  try {
    const prefix = core.getInput('prefix') || ''
    await exec('git config --local user.email "action@github.com"')
    await exec('git config --local user.name "Push Version Tag Action"')
    console.log('Git configured')
    const version = getVersion()
    const tag = await createTag(version, prefix)
    if (!tag) {
      console.log('Tag already created')
      core.setOutput('success', false)
      return
    }
    console.log(`Tag ${tag} created`)
    await pushTag()
    console.log(`Tag ${tag} pushed`)
    core.setOutput('success', true)
  } catch (e) {
    core.setOutput('success', false)
    core.setFailed(e)
  }
}

run()
