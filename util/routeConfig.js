export const routeConfig = {
  GALLERY: (category, id) => ({
    create : {
      endpoint : `/api/post/${category.toLowerCase()}`,
      redirectPath : `/GALLERY/${category}`,
      revalidatePath : `/GALLERY/${category}`,
    },
    delete : {
      endpoint : `/api/delete/${category.toLowerCase()}/${id}`,
      redirectPath : `/GALLERY/${category}`,
      revalidatePath : `/GALLERY/${category}`,
    },
  }),
  SPONSORSHIP: (id) => ({
    create : {
      endpoint : `/api/post/sponsorship`,
      redirectPath : `/SPONSORSHIP`,
      revalidatePath : `/SPONSORSHIP`,
    },
    delete : {
      endpoint : `/api/delete/sponsorship/${id}`,
      redirectPath : `/SPONSORSHIP`,
      revalidatePath : `/SPONSORSHIP`,
    },
  })
}

export function getRouteConfig(section, action, category, id) {
  const sectionConfig = routeConfig[section]
  if (!sectionConfig) {
    throw new Error(`Invalid section: ${section}`)
  }
  
  const config = sectionConfig(category, id)[action]
  if (!config) {
    throw new Error(`Invalid action: ${action}`)
  }
  return config
}
